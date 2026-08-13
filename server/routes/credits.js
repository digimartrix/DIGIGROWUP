import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import CreditTransaction from '../models/CreditTransaction.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendAutomatedNotification } from '../utils/notify.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Initialize Razorpay instance with latest credentials
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_TOl3ZXZSruwwBj';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '6xQw31SKVgTW3X3u7ruAQOgf';
  return new Razorpay({ key_id, key_secret });
};

// Credit Packages Definition
const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    bonus: 0,
    totalCredits: 100,
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
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TOl3ZXZSruwwBj'
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

// POST /api/credits/create-order (and /api/create-order) - Standard Razorpay Order Creation
export const handleCreateOrder = async (req, res, next) => {
  try {
    const { packageId, amount, currency = 'INR', receipt } = req.body;
    let finalAmountInPaise = 0;
    let selectedPkg = null;

    if (packageId) {
      selectedPkg = CREDIT_PACKAGES.find(p => p.id === packageId);
      if (!selectedPkg) {
        return res.status(400).json({ success: false, message: 'Invalid credit package selected.' });
      }
      finalAmountInPaise = selectedPkg.priceINR * 100;
    } else if (amount) {
      // Amount in paise or rupees (if < 100, treated as rupees; if >= 100, validated as paise)
      const numAmount = Number(amount);
      finalAmountInPaise = numAmount < 100 ? Math.round(numAmount * 100) : Math.round(numAmount);
    } else {
      finalAmountInPaise = 9900; // Default ₹99
    }

    if (finalAmountInPaise < 100) {
      return res.status(400).json({ success: false, message: 'Minimum order amount must be at least 100 paise (₹1).' });
    }

    const razorpay = getRazorpayInstance();
    const orderOptions = {
      amount: finalAmountInPaise,
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${req.user?.id ? req.user.id.slice(-6) : 'guest'}_${Date.now().toString().slice(-6)}`,
      notes: {
        userId: req.user?.id ? String(req.user.id) : 'guest',
        userEmail: req.user?.email || '',
        packageId: selectedPkg?.id || 'custom',
        credits: String(selectedPkg?.totalCredits || selectedPkg?.credits || Math.round(finalAmountInPaise / 100)),
        packageName: selectedPkg?.name || 'DigiCredits Top-up'
      }
    };

    const order = await razorpay.orders.create(orderOptions);

    res.json({
      success: true,
      order_id: order.id,
      orderId: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_TOl3ZXZSruwwBj',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TOl3ZXZSruwwBj',
      package: selectedPkg
    });
  } catch (err) {
    console.error('[RAZORPAY_CREATE_ORDER_ERROR]', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create Razorpay order.' });
  }
};

router.post('/create-order', protect, handleCreateOrder);

// POST /api/credits/verify-payment (and /api/verify-payment) - Standard Signature Verification
export const handleVerifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      order_id,
      razorpay_payment_id,
      payment_id,
      razorpay_signature,
      signature,
      packageId
    } = req.body;

    const orderId = razorpay_order_id || order_id;
    const paymentId = razorpay_payment_id || payment_id;
    const clientSignature = razorpay_signature || signature;

    if (!orderId || !paymentId || !clientSignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification parameters (order_id, payment_id, signature).'
      });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || '6xQw31SKVgTW3X3u7ruAQOgf';

    // Verify HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== clientSignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch. Transaction not authenticated.'
      });
    }

    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    const creditsToAdd = pkg ? Number(pkg.totalCredits || pkg.credits) : 100;

    // Credit user balance in MongoDB
    let newBalance = 0;
    if (req.user?.id) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.creditsBalance = (user.creditsBalance || 0) + creditsToAdd;
        user.careerReadinessScore = Math.min(100, (user.careerReadinessScore || 0) + 5);
        await user.save();
        newBalance = user.creditsBalance;

        // Log transaction in CreditTransaction
        await CreditTransaction.create({
          userId: user._id,
          type: 'EARN',
          amount: creditsToAdd,
          reason: `Purchased ${pkg ? pkg.name : `${creditsToAdd} Credits`} via Razorpay (Payment ID: ${paymentId})`,
        });

        // Log to ActivityLog
        ActivityLog.create({
          userId: user._id,
          userName: user.name,
          userRole: user.role,
          action: 'USER_ROLE_CHANGED',
          target: `Razorpay Top-up: ${creditsToAdd} DigiCredits`,
          metadata: { orderId, paymentId, packageId }
        }).catch(() => {});

        // Automatically dispatch notification to database and Google Apps Script
        sendAutomatedNotification({
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          message: `Razorpay Top-Up Successful: Added ${creditsToAdd} DigiCredits to wallet (Payment ID: ${paymentId}). New Balance: ${user.creditsBalance} credits.`,
          type: 'reward'
        });
      }
    }

    res.json({
      success: true,
      status: 'success',
      message: `🎉 Payment verified successfully! Added ${creditsToAdd} DigiCredits to your wallet.`,
      creditsBalance: newBalance,
      paymentId,
      orderId
    });
  } catch (err) {
    console.error('[RAZORPAY_VERIFY_ERROR]', err);
    res.status(500).json({ success: false, message: 'Internal server error during payment verification.' });
  }
};

router.post('/verify-payment', protect, handleVerifyPayment);

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

    // Automatically dispatch notification to database and Google Apps Script
    sendAutomatedNotification({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      message: `Earned ${amount} DigiCredits: ${reason}. Wallet balance: ${user.creditsBalance} credits.`,
      type: 'reward'
    });

    res.json({ success: true, message: 'Credits rewarded successfully.', creditsBalance: user.creditsBalance });
  } catch (err) { next(err); }
});

export default router;
