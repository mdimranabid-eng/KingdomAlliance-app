import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, Users, Calendar, Download, FileText, BarChart3, PieChart } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: any;
}

export default function AdminReportModal({ isOpen, onClose, stats }: AdminReportModalProps) {
  // Mock data for the report
  const monthlyData = [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 52 },
    { month: 'Mar', count: 48 },
    { month: 'Apr', count: 61 },
    { month: 'May', count: 55 },
    { month: 'Jun', count: 67 },
  ];

  const yearlyData = [
    { year: '2022', count: 450 },
    { year: '2023', count: 580 },
    { year: '2024', count: 720 },
    { year: '2025', count: 850 },
  ];

  const maxMonthly = Math.max(...monthlyData.map(d => d.count));
  const maxYearly = Math.max(...yearlyData.map(d => d.count));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-surface-container-lowest rounded-[2.5rem] shadow-2xl border border-outline-variant overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="font-headline text-3xl text-on-surface">Activity Performance Report</h2>
                  <p className="text-sm text-on-surface-variant font-medium">Monthly & Yearly Analytical Overview</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-3 bg-surface hover:bg-surface-variant border border-outline-variant rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm font-bold">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
                <button onClick={onClose} className="p-2 hover:bg-surface-variant rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard 
                  label="Average Monthly Growth" 
                  value="+12.5%" 
                  icon={TrendingUp} 
                  trend="up"
                />
                <SummaryCard 
                  label="Active Profiles (Avg)" 
                  value={Math.floor(stats.totalUsers * 0.85)} 
                  icon={Users} 
                />
                <SummaryCard 
                  label="Conversion Rate" 
                  value="24%" 
                  icon={PieChart} 
                />
              </div>

              {/* Monthly Graph Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline text-2xl text-on-surface flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-primary" /> Monthly Registrations
                  </h3>
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest bg-surface-variant/20 px-3 py-1 rounded-full">
                    Last 6 Months
                  </span>
                </div>
                
                <div className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant h-64 relative flex items-end justify-between gap-4">
                  {monthlyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                      <div className="relative w-full flex justify-center">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${(d.count / maxMonthly) * 160}px` }}
                          transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                          className="w-12 bg-gradient-to-t from-primary to-primary-container rounded-t-xl group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all"
                        />
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-on-primary text-[10px] px-2 py-1 rounded-md font-bold">
                          {d.count}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-on-surface-variant">{d.month}</span>
                    </div>
                  ))}
                  {/* Grid Lines */}
                  <div className="absolute inset-x-8 top-12 bottom-12 border-b border-outline-variant/30 pointer-events-none" />
                  <div className="absolute inset-x-8 top-1/2 bottom-12 border-b border-outline-variant/30 pointer-events-none" />
                </div>
              </div>

              {/* Yearly Data Table & Graph */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="font-headline text-2xl text-on-surface">Yearly Projection</h3>
                  <div className="bg-surface-container-low rounded-[2rem] p-6 border border-outline-variant">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-outline-variant">
                          <th className="pb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Year</th>
                          <th className="pb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Profiles</th>
                          <th className="pb-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Growth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30">
                        {yearlyData.map((d, i) => (
                          <tr key={i} className="hover:bg-surface-variant/5">
                            <td className="py-4 font-bold text-on-surface">{d.year}</td>
                            <td className="py-4 text-on-surface-variant">{d.count}</td>
                            <td className="py-4">
                              <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                                +{i * 5 + 15}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-headline text-2xl text-on-surface">Executive Summary</h3>
                  <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10 h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <FileText className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <p className="text-sm text-on-surface-variant leading-relaxed italic">
                        "The platform has seen a consistent 15% month-over-month increase in active member profiles. User engagement with 'Interest' features has reached a new peak in Q2 2025, indicating high community trust and platform effectiveness."
                      </p>
                      <div className="pt-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary">
                          <CheckCircle className="w-4 h-4" /> Community Trust Score: 9.4/10
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-primary">
                          <CheckCircle className="w-4 h-4" /> Data Integrity: 100%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-surface-container border-t border-outline-variant flex justify-center">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                Kingdom Alliance Institutional Reporting System &copy; 2025
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SummaryCard({ label, value, icon: Icon, trend }: any) {
  return (
    <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant shadow-sm flex items-center gap-4">
      <div className="p-3 bg-surface rounded-2xl border border-outline-variant">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-headline text-on-surface">{value}</p>
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}
