import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  CreditCard, Sparkles, CheckCircle2, AlertCircle, ShoppingCart,
  Clock, ArrowUpRight, ArrowDownLeft, ShieldCheck, Zap,
  TrendingUp, Award, RefreshCw
} from 'lucide-react'

const PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    bonus: 0,
    totalCredits: 100,
    priceINR: 99,
    desc: 'Great for unlocking 2 standard courses or project modules.',
    badge: 'STARTER',
    badgeColor: 'bg-[#3895D2]/10 text-[#3895D2] border-[#3895D2]/30'
  },
  {
    id: 'popular',
    name: 'Engineer Pro Pack',
    credits: 300,
    bonus: 50,
    totalCredits: 350,
    priceINR: 249,
    desc: 'Most popular! Unlocks 7+ courses with 50 free bonus credits.',
    badge: 'MOST POPULAR',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  {
    id: 'mastery',
    name: 'Full Stack Master Pack',
    credits: 750,
    bonus: 150,
    totalCredits: 900,
    priceINR: 499,
    desc: 'Unlock comprehensive tracks, live workshops and 150 bonus credits.',
    badge: 'BEST VALUE',
    badgeColor: 'bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/30'
  },
  {
    id: 'ultimate',
    name: 'Ultimate Ecosystem Pack',
    credits: 2000,
    bonus: 500,
    totalCredits: 2500,
    priceINR: 999,
    desc: 'Unlimited pass: all courses, mentor sessions, and AI tutoring.',
    badge: 'ULTIMATE PASS',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  }
]

export default function DigiCredits() {
  const { user, refreshUser } = useAuth()
  const [balance, setBalance] = useState(user?.creditsBalance || 245)
  const [ledger, setLedger] = useState([])
  const [loading, setLoading] = useState(true)
  const [purchasingPkgId, setPurchasingPkgId] = useState(null)
  const [toast, setToast] = useState({ msg: '', isErr: false })

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast({ msg: '', isErr: false }), 5000)
  }

  useEffect(() => {
    loadCreditsData()
  }, [])

  const loadCreditsData = async () => {
    try {
      const [balRes, histRes] = await Promise.allSettled([
        api.get('/credits/balance'),
        api.get('/credits/history')
      ])
      if (balRes.status === 'fulfilled' && balRes.value.data?.success) {
        setBalance(balRes.value.data.balance)
      }
      if (histRes.status === 'fulfilled' && histRes.value.data?.success) {
        setLedger(histRes.value.data.data || [])
      }
    } catch (err) {
      console.error('Failed to load credits:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Razorpay Checkout
  const handleBuyCredits = async (pkg) => {
    if (!window.Razorpay) {
      showToast('Razorpay payment gateway is still initializing. Please wait a moment and try again.', true)
      return
    }

    setPurchasingPkgId(pkg.id)

    try {
      // 1. Create order on server
      const orderRes = await api.post('/credits/create-order', { packageId: pkg.id })
      if (!orderRes.data?.success) {
        showToast(orderRes.data?.message || 'Failed to initiate checkout.', true)
        setPurchasingPkgId(null)
        return
      }

      const { orderId, amount, currency, keyId } = orderRes.data

      // 2. Open Razorpay Checkout Modal
      const razorpayKey = keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TOl3ZXZSruwwBj';
      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency || 'INR',
        name: 'DigiGrowUp Learning Platform',
        description: `Top-up: ${pkg.totalCredits || pkg.credits} DigiCredits (${pkg.name})`,
        image: '/favicon_circle.png',
        order_id: orderId,
        handler: async function (response) {
          try {
            // 3. Verify payment signature on backend
            const verifyRes = await api.post('/credits/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageId: pkg.id
            })

            if (verifyRes.data?.success) {
              setBalance(verifyRes.data.creditsBalance)
              showToast(`🎉 Payment verified! Added ${pkg.totalCredits || pkg.credits} DigiCredits to your wallet.`)
              if (refreshUser) refreshUser()
              await loadCreditsData()
            } else {
              showToast('Payment verification failed on server.', true)
            }
          } catch (err) {
            showToast(err.response?.data?.message || 'Verification error.', true)
          } finally {
            setPurchasingPkgId(null)
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: ''
        },
        theme: {
          color: '#3895D2'
        },
        modal: {
          ondismiss: function () {
            setPurchasingPkgId(null)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        showToast(`Payment failed: ${response.error?.description || 'Transaction cancelled'}`, true)
        setPurchasingPkgId(null)
      })
      rzp.open()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start payment.', true)
      setPurchasingPkgId(null)
    }
  }

  if (loading) return (
    <div className="space-y-6 max-w-6xl">
      <div className="h-40 rounded-2xl bg-slate-800/40 border border-slate-800 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-64 rounded-2xl bg-slate-800/40 border border-slate-800 animate-pulse" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="page-enter max-w-6xl space-y-8 pb-16">
      {/* Toast Alert */}
      {toast.msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium border ${
          toast.isErr ? 'bg-[#0F172A] text-rose-400 border-rose-500/30' : 'bg-[#0F172A] text-emerald-400 border-emerald-500/30'
        }`}>
          {toast.isErr ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner & Live Balance Widget */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#3895D2]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#3895D2] font-bold uppercase mb-2">
            <Sparkles size={14} />
            <span>DIGICREDITS STORE & WALLET</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white">
            Ecosystem Credits & Payment Portal
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
            Top-up DigiCredits instantly via Razorpay to unlock specialized courses, premium mentorship sessions, and certification assessments.
          </p>
        </div>

        {/* Balance Card */}
        <div className="relative z-10 bg-[#1E293B] border border-slate-700 rounded-xl p-5 flex items-center gap-4 flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-[#3895D2]/20 border border-[#3895D2]/40 flex items-center justify-center text-[#3895D2] flex-shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Your Wallet Balance</p>
            <p className="font-mono text-3xl font-black text-white">
              {balance} <span className="text-xs text-[#3895D2]">CREDITS</span>
            </p>
          </div>
        </div>
      </div>

      {/* RAZORPAY PACKAGES STORE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-heading font-black text-slate-850 tracking-tight flex items-center gap-2">
              <Zap size={18} className="text-[#E8A33D]" />
              <span>Purchase Additional DigiCredits (Powered by Razorpay)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Secure payments via UPI, Credit/Debit Cards, NetBanking, and Wallets.
            </p>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Sparkles size={13} className="text-amber-500" />
            RAZORPAY TEST SANDBOX
          </span>
        </div>

        {/* Sandbox Test Mode Helper Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-500">
            <AlertCircle size={15} />
            <span>How to complete payments in Razorpay Test Mode:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 font-medium">
            <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
              <p className="font-bold text-slate-850 mb-0.5">💳 Test Card:</p>
              <p className="font-mono text-[11px] text-slate-600">Card: 4111 1111 1111 1111</p>
              <p className="font-mono text-[11px] text-slate-600">Exp: 12/28 | CVV: 123</p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
              <p className="font-bold text-slate-850 mb-0.5">📱 Test UPI:</p>
              <p className="font-mono text-[11px] text-slate-600">Enter: test@razorpay</p>
              <p className="text-[10px] text-amber-700 mt-0.5">(Do not scan with real GPay phone app)</p>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-amber-200/60">
              <p className="font-bold text-slate-850 mb-0.5">🏦 Test NetBanking:</p>
              <p className="text-[11px] text-slate-600">Select any bank (SBI / HDFC)</p>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Click "Success" on simulation screen</p>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map((pkg) => {
            const isPurchasing = purchasingPkgId === pkg.id
            return (
              <div
                key={pkg.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transform transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
              >
                {/* Package Top Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${pkg.badgeColor}`}>
                    {pkg.badge}
                  </span>
                  {pkg.bonus > 0 && (
                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      +{pkg.bonus} Free
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-heading font-bold text-slate-800 text-lg mb-1">{pkg.name}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed mb-5 min-h-[36px]">{pkg.desc}</p>
                  
                  {/* Credit Amount Highlight */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-5 text-center">
                    <span className="font-mono text-3xl font-black text-slate-800 block">
                      {pkg.totalCredits || pkg.credits}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                      TOTAL DIGICREDITS
                    </span>
                  </div>
                </div>

                {/* Price & Buy Button */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase font-bold">Price</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-bold text-slate-500">₹</span>
                      <span className="text-2xl font-black font-heading text-slate-900">{pkg.priceINR}</span>
                      <span className="text-[10px] text-slate-400 font-mono">INR</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBuyCredits(pkg)}
                    disabled={purchasingPkgId !== null}
                    className="w-full bg-[#3895D2] hover:bg-[#2c7db5] text-white py-2.5 rounded-xl text-xs font-bold font-heading transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPurchasing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Opening Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} />
                        <span>Buy for ₹{pkg.priceINR} →</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* TRANSACTION HISTORY LEDGER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase font-bold text-slate-700 tracking-wider flex items-center gap-2">
            <Clock size={16} className="text-slate-400" />
            <span>DigiCredits Ledger Activity</span>
          </h3>
          <button
            onClick={loadCreditsData}
            title="Refresh transaction ledger"
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {ledger.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CreditCard size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700 text-sm">No credit transactions yet.</p>
              <p className="text-xs text-slate-500 mt-0.5">Top-up credits or solve challenges to view your ledger stream.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {ledger.map((t) => {
                const isEarn = t.type === 'EARN' || t.type === 'BONUS'
                return (
                  <div key={t._id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isEarn ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {isEarn ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{t.reason || 'Transaction'}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {new Date(t.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`font-mono text-sm font-black ${isEarn ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isEarn ? `+${t.amount}` : `-${t.amount}`}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                        {t.type}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
