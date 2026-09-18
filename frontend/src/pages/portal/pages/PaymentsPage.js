import React from "react";
import { 
  Wallet, 
  IndianRupee, 
  TrendingUp, 
  ArrowRight,
  Receipt,
  AlertCircle,
  Package,
  History,
  CheckCircle2
} from "lucide-react";
import { usePortal } from "../context/PortalContext";
import ComingSoon from "../components/ComingSoon";

export default function PaymentsPage() {
  const { project } = usePortal();

  if (!project) return <ComingSoon title="Payments & Cost" icon={Wallet} />;

  // 1. Core Financial Data
  const contractValue = project.contract_value || 0;
  
  // Total paid is driven explicitly by Admin's Payment Logs
  const amountPaid = project.amount_spent || 0;
  const balanceDue = contractValue > 0 ? contractValue - amountPaid : 0;
  const pctPaid = contractValue > 0 ? Math.round((amountPaid / contractValue) * 100) : 0;

  // 2. Materials Expense Data (Sorted newest first by timestamp/date, or reversed array order as fallback)
  const materials = [...(project.materials || [])].sort((a, b) => {
    const timeA = new Date(a.date || a.created_at || a.timestamp || 0).getTime();
    const timeB = new Date(b.date || b.created_at || b.timestamp || 0).getTime();
    if (timeA && timeB && timeA !== timeB) return timeB - timeA;
    return 0;
  });

  // Fallback reversal if material items lack explicit date properties
  const hasMaterialDates = (project.materials || []).some(m => m.date || m.created_at || m.timestamp);
  if (!hasMaterialDates) {
    materials.reverse();
  }

  const totalMaterialExpenses = materials
    .filter(m => m.payment_status === "paid")
    .reduce((sum, m) => sum + (Number(m.total_cost) || 0), 0);

  // 3. Payment History Logs (Sorted strictly newest first by date)
  const paymentsLog = [...(project.payments_log || [])].sort((a, b) => {
    const timeA = new Date(a.date || a.created_at || 0).getTime();
    const timeB = new Date(b.date || b.created_at || 0).getTime();
    return timeB - timeA;
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 font-['Poppins'] pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#000F1B] grid place-items-center shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#000F1B] tracking-tight">Financial Ledger</h1>
            <p className="text-sm text-[#111111]/60 mt-0.5">Transparent tracking of your project budget, payments, and material costs.</p>
          </div>
        </div>
      </div>

      {contractValue === 0 ? (
        <div className="bg-white rounded-3xl border border-black/5 p-12 text-center shadow-sm">
          <IndianRupee className="w-12 h-12 text-[#111111]/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#000F1B]">Financial Data Syncing</h2>
          <p className="text-sm text-[#111111]/50 mt-1 max-w-sm mx-auto">
            Your project manager is currently finalizing your master budget and initial payment ledgers. This module will unlock shortly.
          </p>
        </div>
      ) : (
        <>
          {/* Row 1: Master Budget Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Total Budget */}
            <div className="rounded-2xl bg-white border border-black/5 p-6 shadow-sm flex flex-col justify-between">
              <div className="text-[11px] font-bold text-[#111111]/50 uppercase tracking-wider mb-4">Master Contract Value</div>
              <div>
                <div className="flex items-center gap-2 text-3xl sm:text-4xl font-extrabold text-[#000F1B] tracking-tight">
                  <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 text-[#111111]/40" strokeWidth={3} /> 
                  {contractValue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#111111]/50 mt-2 font-medium">Excluding applicable GST & customized add-ons.</div>
              </div>
            </div>

            {/* Amount Paid */}
            <div className="rounded-2xl bg-[#000F1B] border border-black/5 p-6 shadow-sm text-white relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#FF5A00]" />
              <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-4">Total Amount Paid</div>
              <div>
                <div className="flex items-center gap-2 text-3xl sm:text-4xl font-extrabold text-[#FF5A00] tracking-tight">
                  <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF5A00]/50" strokeWidth={3} /> 
                  {amountPaid.toLocaleString('en-IN')}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-white/80 border-t border-white/10 pt-3">
                  <span>{pctPaid}% of Contract Paid</span>
                  <TrendingUp className="w-4 h-4 text-[#FF5A00]" />
                </div>
              </div>
            </div>

            {/* Balance Remaining */}
            <div className="rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm flex flex-col justify-between">
              <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-4">Balance Remaining</div>
              <div>
                <div className="flex items-center gap-2 text-3xl sm:text-4xl font-extrabold text-[#000F1B] tracking-tight">
                  <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 text-[#111111]/40" strokeWidth={3} /> 
                  {balanceDue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#111111]/50 mt-2 font-medium">Payable upon future milestone completions.</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Payment History Log (55%) */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-[#000F1B]">Payment History Ledger</h2>
                    <p className="text-xs text-[#111111]/50 mt-0.5">Chronological record of all payments received (most recent first).</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 grid place-items-center shrink-0 border border-blue-100">
                    <History className="w-5 h-5 text-blue-600" />
                  </div>
                </div>

                {paymentsLog.length === 0 ? (
                  <div className="text-center py-10 bg-[#F5F6F8] rounded-xl border border-dashed border-black/10">
                    <Receipt className="w-8 h-8 text-[#111111]/20 mx-auto mb-2" />
                    <p className="text-xs text-[#111111]/50 font-medium">No payments recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentsLog.map((p, idx) => (
                      <div key={p.id || idx} className="flex items-center justify-between p-4 rounded-xl border border-black/5 bg-[#F9FAFB] hover:border-black/15 transition">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 grid place-items-center shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="text-base font-bold text-[#000F1B]">₹ {Number(p.amount).toLocaleString('en-IN')}</div>
                            <div className="text-[10px] font-semibold text-[#111111]/50 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                              <span>{new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric'})}</span>
                              <span>•</span>
                              <span>{p.method}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 max-w-[120px]">
                          <div className="text-[9px] uppercase tracking-widest font-bold text-[#111111]/40 mb-1">Reference No.</div>
                          <div className="text-xs font-mono font-bold text-[#000F1B] truncate">{p.reference || "N/A"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Material Expense Roll-up (45%) */}
            <div className="lg:col-span-6 xl:col-span-5 bg-white rounded-2xl border border-black/5 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#000F1B]">Material Expense Roll-Up</h2>
                  <p className="text-xs text-[#111111]/50 mt-0.5">Physical assets deployed to site (most recent first).</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 grid place-items-center shrink-0 border border-amber-100">
                  <Package className="w-4 h-4 text-amber-500" />
                </div>
              </div>

              {materials.length === 0 ? (
                <div className="text-center py-10 bg-[#F5F6F8] rounded-xl border border-dashed border-black/10">
                  <Package className="w-8 h-8 text-[#111111]/20 mx-auto mb-2" />
                  <p className="text-xs text-[#111111]/50 font-medium">No material expenses logged yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 no-scrollbar">
                    {materials.map((m, idx) => {
                      if (!m.total_cost) return null;
                      
                      return (
                        <div key={m.id || idx} className="flex items-center justify-between p-3.5 rounded-xl border border-black/5 hover:bg-[#F9FAFB] transition">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${m.payment_status === "paid" ? "bg-[#10B981]" : "bg-amber-400"}`} />
                            <div>
                              <div className="text-sm font-bold text-[#000F1B] leading-snug">{m.item_name}</div>
                              <div className="text-[9px] font-semibold text-[#FF5A00] uppercase tracking-wider mt-0.5">
                                {m.quantity} {m.unit} • {m.category}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold text-[#000F1B]">₹ {(Number(m.total_cost) || 0).toLocaleString('en-IN')}</div>
                            <div className="text-[9px] text-[#111111]/40 font-bold uppercase tracking-widest mt-0.5">
                              {m.payment_status}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="pt-4 border-t border-black/10 flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-[#111111]/50 uppercase tracking-widest">Total Material Value</span>
                    <span className="text-xl font-black text-[#10B981]">
                      ₹ {totalMaterialExpenses.toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                      <strong className="font-bold block mb-0.5">Transparency Guarantee:</strong> 
                      This ledger proves exactly how much of your paid budget has been deployed into high-quality physical assets and raw materials on your site.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </>
      )}
    </div>
  );
}