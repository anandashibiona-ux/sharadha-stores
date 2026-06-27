const prisma = require('../db/prisma');
const { decrementStock } = require('../services/stock.service');
const { restoreStock } = require('../services/stock.service');
const { createError } = require('../utils/httpError');
const paymentService = require('../services/payment.service');
const emailService = require('../services/email.service');

const DELIVERY_FEES = {
  standard: 50,
  express: 120,
  free: 0,
};
const FREE_DELIVERY_THRESHOLD = 500;

/**
 * Generate a human-readable order number like SS-20240619-A3F2
 */
const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SS-${date}-${suffix}`;
};

// POST /api/orders — place order (atomic)
const placeOrder = async (req, res, next) => {
  try {
    const { sessionId, customer: customerData, deliveryOption, paymentMethod, paymentStatus } = req.body;

    // 1. Fetch cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
    });
    if (cartItems.length === 0) throw createError(400, 'Cart is empty');

    // 2. Compute totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const deliveryFee =
      subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEES[deliveryOption] ?? DELIVERY_FEES.standard;
    const total = subtotal + deliveryFee;

    const orderNumber = generateOrderNumber();

    // 3. Atomic transaction: create customer, create order, create order_items, decrement stock, clear cart
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock (will throw 409 if insufficient)
      await decrementStock(
        tx,
        cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      );

      const customer = await tx.customer.create({
        data: {
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email || null,
          addressLine1: customerData.addressLine1,
          addressLine2: customerData.addressLine2 || null,
          city: customerData.city,
          state: customerData.state,
          pincode: customerData.pincode,
          deliveryNotes: customerData.deliveryNotes || null,
        },
      });

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status: 'PENDING',
          paymentStatus: paymentStatus || 'PENDING',
          paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
          subtotal,
          deliveryFee,
          total,
          deliveryOption,
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              unitPrice: item.product.price,
              quantity: item.quantity,
              lineTotal: Number(item.product.price) * item.quantity,
            })),
          },
        },
        include: {
          customer: true,
          orderItems: { include: { product: { select: { imageUrl: true, slug: true } } } },
        },
      });

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { sessionId } });

      return newOrder;
    });

    // 4. Log notification (placeholder for email/WhatsApp)
    console.log(`[NOTIFICATION] Order ${order.orderNumber} placed by ${order.customer.name} (${order.customer.phone}). Total: ₹${order.total}`);

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:orderNumber — customer order status lookup
const getOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: true,
        payment: true,
        orderItems: {
          include: { product: { select: { imageUrl: true, slug: true } } },
        },
      },
    });
    if (!order) throw createError(404, `Order ${orderNumber} not found`);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:orderNumber/pay — update payment status after order is created
const updatePayment = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { paymentMethod, paymentStatus } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
      include: { payment: true }
    });

    if (!existingOrder) throw createError(404, `Order ${orderNumber} not found`);

    if (existingOrder.paymentStatus === 'PAID' || existingOrder.payment) {
      throw createError(400, `Order ${orderNumber} is already paid`);
    }

    // Use provided Transaction ID or generate a fallback
    let transactionId = req.body.transactionId;
    if (!transactionId) {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      transactionId = `TXN-${date}-${suffix}`;
    }

    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { orderNumber },
        data: { 
          paymentMethod, 
          paymentStatus,
          status: 'CONFIRMED' // Mark order as confirmed once payment step is complete
        },
      });

      if (['PAID', 'VERIFICATION_PENDING', 'CONFIRMED'].includes(paymentStatus)) {
        await tx.payment.create({
          data: {
            transactionId,
            orderId: existingOrder.id,
            amount: existingOrder.total,
            paymentMethod,
            paymentStatus,
          }
        });
      }

      return updatedOrder;
    });

    res.json(order);
  } catch (err) {
    if (err.code === 'P2025') next(createError(404, `Order ${req.params.orderNumber} not found`));
    else next(err);
  }
};

// POST /api/orders/initiate-payment
const initiatePayment = async (req, res, next) => {
  try {
    const { type, sessionId, customer, deliveryOption, paymentMethod } = req.body;
    
    // 1. Fetch cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
    });
    if (cartItems.length === 0) throw createError(400, 'Cart is empty');

    // 2. Compute totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEES[deliveryOption] ?? DELIVERY_FEES.standard;
    const total = subtotal + deliveryFee;

    if (paymentMethod === 'CASH_ON_DELIVERY') {
      return res.json({ provider: 'COD', method: paymentMethod });
    }

    const tempOrderId = generateOrderNumber(); // For intent reference only
    const intent = await paymentService.createPaymentIntent(total, tempOrderId);
    
    res.json({ ...intent, customer });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders/verify-payment
const verifyPayment = async (req, res, next) => {
  try {
    const { type, sessionId, customer: customerData, deliveryOption, paymentData, paymentMethod, paymentDetails } = req.body;

    // 1. Validate payment signature early
    let transactionId;
    let paymentStatus = 'PAID';
    let gatewayResponse = null;

    if (paymentMethod === 'CASH_ON_DELIVERY') {
      paymentStatus = 'CONFIRMED';
      transactionId = `COD-${Date.now()}`;
    } else if (paymentMethod === 'UPI') {
      paymentStatus = 'VERIFICATION_PENDING';
      transactionId = `UPI-${paymentDetails?.upiId || 'MANUAL'}-${Date.now()}`;
    } else {
      const isValid = paymentService.verifyPaymentSignature(paymentData);
      if (!isValid) throw createError(400, 'Invalid payment signature');

      transactionId = paymentData.razorpay_payment_id || paymentData.mock_payment_id;
      gatewayResponse = JSON.stringify(paymentData);
    }

    // 2. Fetch Cart
    const cartItems = await prisma.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
    });
    if (cartItems.length === 0) throw createError(400, 'Cart is empty or already processed');

    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEES[deliveryOption] ?? DELIVERY_FEES.standard;
    const total = subtotal + deliveryFee;

    const orderNumber = generateOrderNumber();

    // 3. Atomic database creation
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock
      await decrementStock(tx, cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })));

      // Check if customer exists by phone, else create
      let dbCustomer = await tx.customer.findFirst({ where: { phone: customerData.phone } });
      if (!dbCustomer) {
        dbCustomer = await tx.customer.create({
          data: {
            name: customerData.name,
            phone: customerData.phone,
            email: customerData.email || null,
            addressLine1: customerData.addressLine1,
            addressLine2: customerData.addressLine2 || null,
            city: customerData.city,
            state: customerData.state,
            pincode: customerData.pincode,
            deliveryNotes: customerData.deliveryNotes || null,
          },
        });
      } else {
        // Update customer details if they changed
        dbCustomer = await tx.customer.update({
          where: { id: dbCustomer.id },
          data: {
            name: customerData.name,
            addressLine1: customerData.addressLine1,
            addressLine2: customerData.addressLine2 || null,
            city: customerData.city,
            state: customerData.state,
            pincode: customerData.pincode,
          }
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: dbCustomer.id,
          userId: req.user ? req.user.userId : null,
          status: 'CONFIRMED',
          paymentStatus,
          paymentMethod,
          subtotal,
          deliveryFee,
          total,
          deliveryOption,
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              unitPrice: item.product.price,
              quantity: item.quantity,
              lineTotal: Number(item.product.price) * item.quantity,
            })),
          },
        },
      });

      // Create Payment
      await tx.payment.create({
        data: {
          transactionId,
          gatewayTxnId: transactionId,
          orderId: newOrder.id,
          amount: total,
          paymentMethod,
          paymentStatus,
          paymentDetails: paymentDetails ? JSON.stringify(paymentDetails) : null,
          gatewayResponse,
        }
      });

      // Clear the cart
      await tx.cartItem.deleteMany({ where: { sessionId } });

      return newOrder;
    });

    console.log(`[NOTIFICATION] Order ${order.orderNumber} successfully placed by ${customerData.name}. Total: ₹${order.total}`);

    // Send asynchronous email
    emailService.sendOrderConfirmationEmail(order, customerData.email);

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:orderNumber/address — update delivery address
const updateAddress = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const customerData = req.body;
    
    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) throw createError(404, `Order ${orderNumber} not found`);

    await prisma.customer.update({
      where: { id: order.customerId },
      data: {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email || null,
        addressLine1: customerData.addressLine1,
        addressLine2: customerData.addressLine2 || null,
        city: customerData.city,
        state: customerData.state,
        pincode: customerData.pincode,
        deliveryNotes: customerData.deliveryNotes || null,
      }
    });
    
    const updatedOrder = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: true,
        orderItems: { include: { product: { select: { imageUrl: true, slug: true } } } },
      },
    });
    
    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/customer/:phone — fetch all orders for a phone number
const getOrdersByPhone = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const orders = await prisma.order.findMany({
      where: { customer: { phone } },
      include: {
        customer: true,
        payment: true,
        orderItems: {
          include: { product: { select: { imageUrl: true, slug: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders — fetch ALL orders (for admin/developer inspection)
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        payment: true,
        orderItems: true
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

module.exports = { placeOrder, getOrder, updatePayment, initiatePayment, verifyPayment, updateAddress, getOrdersByPhone, getAllOrders };
