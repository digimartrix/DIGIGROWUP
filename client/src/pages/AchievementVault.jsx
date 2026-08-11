import { Award } from 'lucide-react'

export default function AchievementVault() {
  return (
    <div className="p-6 page-enter">
      <div className="max-w-4xl">
        {/* Header info */}
        <div className="mb-6">
          <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1.5">VERIFIED ACHIEVEMENTS</p>
          <p className="text-slate-500 text-xs md:text-sm">
            Your earned credentials, certificates, and completed challenge badges. Everything is verifiable in the public ledger.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cert Card */}
          <div className="bg-white border border-slate-200 rounded-md p-6 md:col-span-2 space-y-4 shadow-3xs">
            <h3 className="font-heading font-bold text-slate-800 text-xs md:text-sm">Verified Credentials</h3>
            
            <div className="border border-slate-200 rounded p-4 flex items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-brandBlue/10 border border-brandBlue/20 flex items-center justify-center text-brandBlue">
                  <Award size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-slate-800 text-xs font-bold leading-none mb-1">Web Development Fundamentals Course</h4>
                  <p className="text-slate-400 font-mono" style={{ fontSize: '9px' }}>ISSUED BY DIGIMARTRIX · ACTIVE</p>
                </div>
              </div>
              <button
                onClick={() => alert('Certificate downloaded successfully!')}
                className="text-xs text-brandBlue font-bold hover:underline"
              >
                Download PDF
              </button>
            </div>

            <div className="border border-slate-200 rounded p-4 flex items-center justify-between gap-4 opacity-50 bg-slate-50/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Award size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-slate-850 text-xs font-bold leading-none mb-1">React Architect & Hooks Mastery</h4>
                  <p className="text-slate-400 font-mono" style={{ fontSize: '9px' }}>LOCKED · MODULE 2 REQUIRED</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="bg-white border border-slate-200 rounded-md p-6 space-y-6 shadow-3xs">
            <h3 className="font-heading font-bold text-slate-800 text-xs md:text-sm">Ecosystem Summary</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 font-mono" style={{ fontSize: '9px' }}>CREDENTIALS EARNED</p>
                <p className="font-mono text-xl font-bold text-slate-800">1</p>
              </div>
              <div>
                <p className="text-slate-400 font-mono" style={{ fontSize: '9px' }}>ECOSYSTEM BADGES</p>
                <p className="font-mono text-xl font-bold text-slate-800">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
