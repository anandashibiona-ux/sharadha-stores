const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const prisma = require('../db/prisma');
const { createError } = require('../utils/httpError');

router.post('/razorpay', async (req, res, next) => {
  try {
    // Razorpay Webhook Signature Verification
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'fallback_secret';
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('[WEBHOOK ERROR] Invalid signature');
      return res.status(400).send('Invalid signature');
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'payment.authorized') {
      const paymentEntity = payload.payment.entity;
      const gatewayTxnId = paymentEntity.id;
      
      // We might want to look up the Payment by gatewayTxnId and update it to PAID
      // However, our intent-first flow creates the Payment record DURING verification!
      // If the webhook arrives, it means payment is successful.
      // If we don't have the Payment record yet, it means the user closed the browser!
      // A robust system would create an Order from the webhook if it doesn't exist, using notes stored in Razorpay order.
      // For this prototype, we'll just log it.
      console.log(`[WEBHOOK SUCCESS] Payment ${gatewayTxnId} captured.`);
    } else if (event === 'payment.failed') {
      console.log(`[WEBHOOK FAILED] Payment failed.`);
    }

    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
