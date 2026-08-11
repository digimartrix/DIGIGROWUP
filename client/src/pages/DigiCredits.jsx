import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Trophy, Clock, ShoppingCart, HelpCircle } from 'lucide-react'

export default function DigiCredits() {
  const [balance, setBalance] = useState(0)
  const [ledger, setLedger] = useState([])
  const [loading, setLoading] = useState(true)

  const items = [
    { name: '1-on-1 Mock Interview Session', price: 100 },
    { name: 'StudyBuddy React UI Boilerplate Set', price: 30 },
  ]

  useEffect(() => {
    async function load() {
      try {
        const [balRes, histRes] = await Promise.all([
          api.get('/credits/balance'),
          api.get('/credits/history')
        ])
        if (balRes.data?.success) setBalance(balRes.data.balance)
        if (histRes.data?.success) setLedger(histRes.data.data)
      } catch (err) {
        console.error('Failed to load credits:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSpend = async (item) => {
    if (balance < item.price) {
      alert('⚠️ Insufficient Credits. Complete quizzes, solve challenges, or build projects to earn more.');
      return;
    }

    try {
      // Create a mock spend transaction in the DB
      const res = await api.post('/credits/reward', {
        amount: -item.price,
        reason: `Redeemed asset: ${item.name}`
      })

      if (res.data?.success) {
        setBalance(res.data.creditsBalance)
        // Refresh transaction list
        const histRes = await api.get('/credits/history')
        if (histRes.data?.success) setLedger(histRes.data.data)
        alert(`🎉 Purchase successful! You unlocked: ${item.name}`);
      }
    } catch (err) {
      alert('Failed to process purchase transaction.')
    }
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-28 rounded-xl bg-white border border-slate-200 shimmer" />
      <div className="h-44 rounded-xl bg-white border border-slate-200 shimmer" />
    </div>
  )

  return (
    <div className="page-enter">
      <div className="max-w-4xl">
        {/* Header info */}
        <div className="mb-6">
          <p className="font-mono text-[9px] text-[#EA4532] uppercase tracking-widest mb-1.5 font-bold">CREDIT ECONOMY</p>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Earn credits by completing quizzes, writing clean code in Practice Labs, and submitting Projects. Spend credits to unlock professional assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Balance Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-center shadow-xs">
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block mb-2 font-bold">CREDIT BALANCE</span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-black text-[#3895D2]">{balance}</span>
              <span className="text-slate-500 text-xs font-bold font-mono">CREDITS</span>
            </div>
          </div>

          {/* Spent details */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 md:col-span-2 space-y-4 shadow-xs">
            <h3 className="font-heading font-bold text-slate-800 text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart size={14} className="text-[#3895D2]" />
              Ecosystem Resource Shop
            </h3>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <p className="text-slate-800 text-xs font-bold">{item.name}</p>
                    <p className="text-slate-500 text-[10px] font-mono mt-0.5 font-bold">{item.price} CREDITS</p>
                  </div>
                  <button
                    onClick={() => handleSpend(item)}
                    className="bg-[#3895D2] hover:bg-[#2c7db5] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-3xs transition-colors"
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger History */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <h3 className="font-heading font-bold text-slate-850 text-xs md:text-sm mb-4 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy size={14} className="text-[#E8A33D]" />
            Transaction History
          </h3>
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {ledger.map((item) => (
              <div key={item._id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-800 font-semibold">{item.reason}</p>
                  <p className="text-slate-400 font-mono text-[9px] mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-mono font-bold ${
                  item.type === 'SPEND' || item.amount < 0 ? 'text-[#EA4532]' : 'text-[#4FB286]'
                }`}>
                  {item.amount < 0 ? '' : '+'}{item.amount}
                </span>
              </div>
            ))}

            {ledger.length === 0 && (
              <p className="text-slate-400 py-6 text-center text-xs">No transactions recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
