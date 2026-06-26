const nodemailer = require('nodemailer');

// For development, we'll use ethereal email if no real SMTP is provided.
// You can view ethereal emails at ethereal.email using the logged credentials.
const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to ethereal for testing
  let testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const sendOrderConfirmationEmail = async (order, customerEmail) => {
  if (!customerEmail) return;
  
  try {
    const transporter = await createTransporter();
    
    // Minimal HTML receipt
    const htmlContent = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order, ${order.customer?.name || 'Customer'}!</p>
      <p>Order ID: <strong>${order.orderNumber}</strong></p>
      <p>Total Amount: <strong>₹${order.total}</strong></p>
      <p>Payment Status: <strong>${order.paymentStatus}</strong></p>
      <p>We will notify you once it ships.</p>
    `;

    const info = await transporter.sendMail({
      from: '"Sharadha Stores" <noreply@sharadhastores.com>',
      to: customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: htmlContent,
    });

    console.log(`[EMAIL] Order confirmation sent to ${customerEmail}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (err) {
    console.error('[EMAIL ERROR]', err);
  }
};

module.exports = { sendOrderConfirmationEmail };
