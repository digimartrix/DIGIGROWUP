import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import CreditTransaction from '../models/CreditTransaction.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TOktzHxMX9hJ7r';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dU038AbbVS44UUNDJaoHoJCT';
  return new Razorpay({ key_id, key_secret });
};

// Credit Packages Definition
const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    bonus: 0,
    priceINR: 99,
    description: 'Perfect for unlocking 2 standard courses or project modules.',
    badge: 'ENTRY'
  },
  {
    id: 'popular',
    name: 'Engineer Pro Pack',
    credits: 300,
    bonus: 50,
    totalCredits: 350,
    priceINR: 249,
    description: 'Most popular! Unlocks 7+ courses with 50 bonus credits.',
    badge: 'POPULAR'
  },
  {
    id: 'mastery',
    name: 'Full Stack Master Pack',
    credits: 750,
    bonus: 150,
    totalCredits: 900,
    priceINR: 499,
    description: 'Comprehensive track access with 150 bonus credits.',
    badge: 'BEST VALUE'
  },
  {
    id: 'ultimate',
    name: 'Ultimate Ecosystem Pack',
    credits: 2000,
    bonus: 500,
    totalCredits: 2500,
    priceINR: 999,
    description: 'Unlimited ecosystem pass: all courses, workshops, and AI tutor.',
    badge: 'ULTIMATE'
  }
];

// GET /api/credits/packages - List available credit top-up packages
router.get('/packages', (req, res) => {
  res.json({
    success: true,
    packages: CREDIT_PACKAGES,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TOktzHxMX9hJ7r'
  });
});

// GET /api/credits/history - Get transaction logs
router.get('/history', protect, async (req, res, next) => {
  try {
    const transactions = await CreditTransaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: transactions });
  } catch (err) { next(err); }
});

// GET /api/credits/balance - Get current balance
router.get('/balance', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('creditsBalance').lean();
    res.json({ success: true, balance: user?.creditsBalance || 0 });
  } catch (err) { next(err); }
});

// POST /api/credits/create-order - Create Razorpay Order
router.post('/create-order', protect, async (req, res, next) => {
  try {
    const { packageId } = req.body;
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      return res.status(400).json({ success: false, message: 'Invalid credit package selected.' });
    }

    const razorpay = getRazorpayInstance();
    const amountInPaise = pkg.priceINR * 100; // Razorpay expects amount in paise

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${req.user.id.slice(-6)}_${Date.now().toString().slice(-6)}`,
      notes: {
        userId: String(req.user.id),
        userEmail: req.user.email,
        packageId: pkg.id,
        credits: String(pkg.totalCredits || pkg.credits),
        packageName: pkg.name
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TOktzHxMX9hJ7r',
      package: pkg
    });
  } catch (err) {
    console.error('[RAZORPAY_ORDER_ERROR]', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create payment order.' });
  }
});

// POST /api/credits/verify-payment - Verify signature and credit user account
router.post('/verify-payment', protect, async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      packageId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification parameters.' });
    }

    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      return res.status(400).json({ success: false, message: 'Invalid package reference.' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dU038AbbVS44UUNDJaoHoJCT';

    // Verify HMAC SHA256 signature
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature.' });
    }

    const creditsToAdd = Number(pkg.totalCredits || pkg.credits);

    // Credit user account
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.creditsBalance = (user.creditsBalance || 0) + creditsToAdd;
    user.careerReadinessScore = Math.min(100, (user.careerReadinessScore || 0) + 5);
    await user.save();

    // Log credit transaction
    await CreditTransaction.create({
      userId: user._id,
      type: 'EARN',
      amount: creditsToAdd,
      reason: `Purchased ${pkg.name} via Razorpay (Payment ID: ${razorpay_payment_id})`,
    });

    // Log to ActivityLog
    ActivityLog.create({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_ROLE_CHANGED', // or general credit topup
      target: `Top-up: ${creditsToAdd} DigiCredits (₹${pkg.priceINR})`,
      metadata: { orderId: razorpay_order_id, paymentId: razorpay_payment_id, packageId }
    }).catch(() => {});

    res.json({
      success: true,
      message: `🎉 Success! Added ${creditsToAdd} DigiCredits to your wallet.`,
      creditsBalance: user.creditsBalance,
      transaction: {
        paymentId: razorpay_payment_id,
        creditsAdded: creditsToAdd,
        newBalance: user.creditsBalance
      }
    });
  } catch (err) {
    console.error('[RAZORPAY_VERIFY_ERROR]', err);
    res.status(500).json({ success: false, message: 'Internal server error verifying payment.' });
  }
});

// POST /api/credits/reward - Reward credits dynamically for passing code arena challenges
router.post('/reward', protect, async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || !reason) {
      return res.status(400).json({ success: false, message: 'Amount and reason are required.' });
    }

    const user = await User.findById(req.user.id);
    user.creditsBalance = (user.creditsBalance || 0) + Number(amount);
    
    // Earn career readiness score boost
    user.careerReadinessScore = Math.min(100, (user.careerReadinessScore || 0) + 3);
    await user.save();

    await CreditTransaction.create({
      userId: req.user.id,
      type: 'EARN',
      amount: Number(amount),
      reason
    });

    res.json({ success: true, message: 'Credits rewarded successfully.', creditsBalance: user.creditsBalance });
  } catch (err) { next(err); }
});

export default router;
