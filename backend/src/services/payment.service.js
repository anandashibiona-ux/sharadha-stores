const Razorpay = require('razorpay');
const crypto = require('crypto');

class PaymentService {
  constructor() {
    this.useRazorpay = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    if (this.useRazorpay) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    }
  }

  async createPaymentIntent(amount, receipt) {
    if (this.useRazorpay) {
      const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: 'INR',
        receipt: receipt,
      };
      const order = await this.razorpay.orders.create(options);
      return {
        provider: 'RAZORPAY',
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      };
    } else {
      // Secure Mock processor
      return {
        provider: 'MOCK',
        orderId: `MOCK_ORD_${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
        amount: Math.round(amount * 100),
        currency: 'INR'
      };
    }
  }

  verifyPaymentSignature(data) {
    if (data.provider === 'RAZORPAY' || data.razorpay_payment_id) {
      if (!this.useRazorpay) return false;
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      return expectedSignature === razorpay_signature;
    } else if (data.provider === 'MOCK' || data.mock_payment_id) {
      // Mock validation
      return !!data.mock_order_id && !!data.mock_payment_id;
    }
    return false;
  }
}

module.exports = new PaymentService();
