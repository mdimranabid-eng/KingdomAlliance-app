import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  TrendingUp, 
  Users, 
  Calendar, 
  Download, 
  FileText, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Mail, 
  Printer, 
  MapPin, 
  GraduationCap, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit, collectionGroup, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { KingdomCrossIcon } from '../KingdomCrossIcon';
import { cn } from '../../lib/utils';
import { format, subDays, startOfDay, isAfter } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import emailjs from '@emailjs/browser';

interface AdminReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReportData {
  summary: {
    totalUsers: number;
    activeToday: number;
    newMonth: number;
    pendingApprovals: number;
  };
  genderDist: { male: number; female: number };
  denomDist: { name: string; count: number }[];
  ageDist: { range: string; count: number }[];
  registrationHistory: { date: string; count: number }[];
  topLocations: { name: string; count: number }[];
  statusBreakdown: { name: string; count: number; color: string }[];
  recentRegistrations: any[];
  pendingActions: any[];
  metrics: {
    totalMale: number;
    totalFemale: number;
    newWeek: number;
    newMonth: number;
    pending: number;
    approved: number;
    rejected: number;
    suspended: number;
    interests: number;
    messages: number;
    photoPending: number;
  };
}

// GoldenCrossIcon removed in favor of reusable KingdomCrossIcon

export default function AdminReportModal({ isOpen, onClose }: AdminReportModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    console.log("🚀 Starting live report data fetch...");
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const weekAgo = subDays(now, 7);
      const monthAgo = subDays(now, 30);
      const todayStart = startOfDay(now);

      // Card 1: Total Users
      const totalUsers = allUsers.length;
      console.log("📊 Card 1 (Total Users):", totalUsers);

      // Card 2: Pending Approvals
      const pending = allUsers.filter(u => u.approvalStatus === 'pending' || (u.isApproved === false && u.approvalStatus !== 'rejected')).length;
      console.log("📊 Card 2 (Pending Approvals):", pending);

      // Card 3: Active Today
      const activeToday = allUsers.filter(u => {
        const lastActive = u.lastActive?.toDate?.() || u.updatedAt?.toDate?.();
        if (!lastActive) return false;
        return format(lastActive, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
      }).length;
      console.log("📊 Card 3 (Active Today):", activeToday);

      // Card 4: New This Week
      const newWeek = allUsers.filter(u => {
        const created = u.createdAt?.toDate?.();
        if (!created) return false;
        return isAfter(created, weekAgo);
      }).length;
      console.log("📊 Card 4 (New This Week):", newWeek);

      const maleUsers = allUsers.filter(u => u.gender === 'male');
      const femaleUsers = allUsers.filter(u => u.gender === 'female');
      const newMonth = allUsers.filter(u => {
        const created = u.createdAt?.toDate?.();
        if (!created) return false;
        return isAfter(created, monthAgo);
      }).length;

      const approved = allUsers.filter(u => u.isApproved === true || u.approvalStatus === 'approved').length;
      const rejected = allUsers.filter(u => u.approvalStatus === 'rejected').length;
      const suspended = allUsers.filter(u => u.status === 'suspended').length;
      const photoPending = allUsers.filter(u => u.photoStatus === 'pending').length;

      // Engagement
      const interestsSnap = await getDocs(collection(db, 'interests'));
      const totalInterests = interestsSnap.size;
      const messagesSnap = await getDocs(query(collectionGroup(db, 'messages')));
      const totalMessages = messagesSnap.size;

      // Composition: Denomination
      const denoms: Record<string, number> = {};
      allUsers.forEach(u => {
        const d = u.denomination || 'Unknown';
        denoms[d] = (denoms[d] || 0) + 1;
      });
      const denomDist = Object.entries(denoms)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      // FIX 2: Age Distribution Buckets
      const ages = { '18–25': 0, '26–30': 0, '31–35': 0, '36–40': 0, '41–50': 0, '50+': 0 };
      allUsers.forEach(u => {
        let ageNum = u.age;
        if (!ageNum && u.dateOfBirth) {
          const dob = u.dateOfBirth.toDate?.() || new Date(u.dateOfBirth);
          if (dob instanceof Date && !isNaN(dob.getTime())) {
            ageNum = currentYear - dob.getFullYear();
          }
        }
        
        if (!ageNum) return;
        
        if (ageNum >= 18 && ageNum <= 25) ages['18–25']++;
        else if (ageNum >= 26 && ageNum <= 30) ages['26–30']++;
        else if (ageNum >= 31 && ageNum <= 35) ages['31–35']++;
        else if (ageNum >= 36 && ageNum <= 40) ages['36–40']++;
        else if (ageNum >= 41 && ageNum <= 50) ages['41–50']++;
        else if (ageNum > 50) ages['50+']++;
      });
      const ageDist = Object.entries(ages).map(([range, count]) => ({ range, count }));
      console.log("📊 Age Distribution Calculated:", ages);

      // Composition: Locations (Top 5)
      const locs: Record<string, number> = {};
      allUsers.forEach(u => {
        const l = u.location?.split(',')[0] || u.city || 'Unknown';
        locs[l] = (locs[l] || 0) + 1;
      });
      const topLocations = Object.entries(locs)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Registration History (Last 30 days)
      const history: Record<string, number> = {};
      for (let i = 0; i < 30; i++) {
        history[format(subDays(now, i), 'MMM dd')] = 0;
      }
      allUsers.forEach(u => {
        const created = u.createdAt?.toDate?.();
        if (created && isAfter(created, monthAgo)) {
          const dateStr = format(created, 'MMM dd');
          if (history[dateStr] !== undefined) history[dateStr]++;
        }
      });
      const registrationHistory = Object.entries(history)
        .map(([date, count]) => ({ date, count }))
        .reverse();

      setData({
        summary: {
          totalUsers,
          activeToday,
          newMonth,
          pendingApprovals: pending
        },
        genderDist: { male: maleUsers.length, female: femaleUsers.length },
        denomDist,
        ageDist,
        registrationHistory,
        topLocations,
        statusBreakdown: [
          { name: 'Approved', count: approved, color: '#16a34a' },
          { name: 'Pending', count: pending, color: '#f59e0b' },
          { name: 'Rejected', count: rejected, color: '#dc2626' },
          { name: 'Suspended', count: suspended, color: '#6b7280' }
        ],
        recentRegistrations: allUsers
          .sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0))
          .slice(0, 10),
        pendingActions: allUsers
          .filter(u => (u.isApproved === false || u.approvalStatus === 'pending') || u.photoStatus === 'pending')
          .slice(0, 10),
        metrics: {
          totalMale: maleUsers.length,
          totalFemale: femaleUsers.length,
          newWeek,
          newMonth,
          pending,
          approved,
          rejected,
          suspended,
          interests: totalInterests,
          messages: totalMessages,
          photoPending
        }
      });
    } catch (err) {
      console.error("❌ Error fetching report data:", err);
    } finally {
      setLoading(false);
      console.log("✅ Report data fetch complete.");
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const generatePrintHTML = (reportData: ReportData) => {
    const nowStr = format(new Date(), 'PPP p');
    const total = reportData.summary.totalUsers || 1;
    const getPerc = (count: number) => Math.round((count / total) * 100);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kingdom Alliance Report - ${format(new Date(), 'yyyy-MM-dd')}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Playfair+Display:ital,wght@1,700&display=swap');
          @page { size: A4 portrait; margin: 16mm; }
          body { 
            font-family: 'Inter', -apple-system, sans-serif; 
            color: #040e2a; 
            line-height: 1.4; 
            margin: 0; 
            padding: 0; 
            font-size: 11px;
            -webkit-print-color-adjust: exact;
          }
          .header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px; page-break-inside: avoid; }
          .header-left { display: flex; align-items: center; gap: 12px; }
          .header-right { text-align: right; }
          .brand-name { font-size: 20px; font-weight: bold; margin: 0; color: #040e2a; }
          .brand-sub { font-size: 10px; color: #d4af37; text-transform: uppercase; letter-spacing: 2px; margin: 0; font-weight: bold; }
          .report-title { font-size: 16px; font-family: 'Playfair Display', serif; font-style: italic; margin: 0; color: #040e2a; }
          .report-date { font-size: 10px; color: #6b7280; margin-top: 4px; }
          
          .divider { height: 2px; width: 100%; display: flex; margin-bottom: 12px; }
          .divider-navy { width: 50%; background: #040e2a; }
          .divider-gold { width: 50%; background: #d4af37; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #e2e3e0; padding: 8px; text-align: left; }
          thead { display: table-header-group; }
          th { background: #040e2a; color: white; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; border-color: #040e2a; }
          tr:nth-child(even) { background: #f8fafc; }
          
          .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border: 1px solid #e2e3e0; margin-bottom: 24px; page-break-inside: avoid; }
          .stat-cell { padding: 12px; text-align: center; border-right: 1px solid #e2e3e0; }
          .stat-cell:last-child { border-right: none; }
          .stat-value { font-size: 22px; font-weight: bold; display: block; color: #040e2a; }
          .stat-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 4px; }
          
          .section-title { font-size: 14px; font-weight: bold; margin: 24px 0 12px; border-bottom: 1px solid #d4af37; padding-bottom: 4px; display: block; color: #040e2a; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .table-container { page-break-inside: avoid; margin-bottom: 20px; }
          
          .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #6b7280; font-style: italic; padding-top: 8px; border-top: 1px solid #040e2a; background: white; left: 0; }
          
          .page-break { page-break-before: always; }
          .no-break { page-break-inside: avoid; }
          
          svg { vertical-align: middle; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="crossGradientPrint" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color: #FFD700; stop-opacity: 1" />
                  <stop offset="100%" style="stop-color: #B8860B; stop-opacity: 1" />
                </linearGradient>
              </defs>
              <path d="M10 2H14V8H20V12H14V22H10V12H4V8H10V2Z" fill="url(#crossGradientPrint)" />
            </svg>
            <div>
              <h1 class="brand-name">Kingdom Alliance</h1>
              <p class="brand-sub">Matrimonial Platform</p>
            </div>
          </div>
          <div class="header-right">
            <h2 class="report-title">Community Health & Activity Report</h2>
            <p class="report-date">Generated: ${nowStr}</p>
          </div>
        </div>
        <div class="divider">
          <div class="divider-navy"></div>
          <div class="divider-gold"></div>
        </div>

        <div class="stat-grid">
          <div class="stat-cell">
            <span class="stat-value">${reportData.summary.totalUsers.toLocaleString()}</span>
            <span class="stat-label">Total Users</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value">${reportData.summary.pendingApprovals.toLocaleString()}</span>
            <span class="stat-label">Pending Approvals</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value">${reportData.summary.activeToday.toLocaleString()}</span>
            <span class="stat-label">Active Today</span>
          </div>
          <div class="stat-cell">
            <span class="stat-value">${reportData.metrics.newWeek.toLocaleString()}</span>
            <span class="stat-label">New This Week</span>
          </div>
        </div>

        <h3 class="section-title">Community Composition</h3>
        
        <div class="grid-2">
          <div class="table-container">
            <table>
              <thead>
                <tr><th>Gender</th><th>Count</th><th>%</th></tr>
              </thead>
              <tbody>
                <tr><td>Male Grooms</td><td>${reportData.genderDist.male}</td><td>${getPerc(reportData.genderDist.male)}%</td></tr>
                <tr><td>Female Brides</td><td>${reportData.genderDist.female}</td><td>${getPerc(reportData.genderDist.female)}%</td></tr>
              </tbody>
            </table>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>Denomination</th><th>Count</th><th>% of Total</th></tr>
              </thead>
              <tbody>
                ${reportData.denomDist.map(d => `<tr><td>${d.name}</td><td>${d.count}</td><td>${getPerc(d.count)}%</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="grid-2">
          <div class="table-container">
            <table>
              <thead>
                <tr><th>Age Range</th><th>Count</th><th>% of Total</th></tr>
              </thead>
              <tbody>
                ${reportData.ageDist.map(d => `<tr><td>${d.range}</td><td>${d.count}</td><td>${getPerc(d.count)}%</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>Approval Status</th><th>Count</th><th>% of Total</th></tr>
              </thead>
              <tbody>
                ${reportData.statusBreakdown.map(d => `<tr><td>${d.name}</td><td>${d.count}</td><td>${getPerc(d.count)}%</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr><th>Top 5 Locations</th><th>Count</th><th>% of Total</th></tr>
            </thead>
            <tbody>
              ${reportData.topLocations.map(d => `<tr><td>${d.name}</td><td>${d.count}</td><td>${getPerc(d.count)}%</td></tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="page-break"></div>
        
        <h3 class="section-title">Registration Activity</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr><th>Date</th><th>New Signups</th></tr>
            </thead>
            <tbody>
              ${reportData.registrationHistory.filter(h => h.count > 0).map(h => `<tr><td>${h.date}</td><td>${h.count}</td></tr>`).join('') || '<tr><td colspan="2">No registrations in the last 30 days.</td></tr>'}
            </tbody>
          </table>
        </div>

        <h3 class="section-title">Recent Registrations</h3>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Denomination</th>
                <th>City</th>
                <th>Date Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.recentRegistrations.map(u => `
                <tr>
                  <td style="font-weight:bold">${u.name}</td>
                  <td style="text-transform:capitalize">${u.gender}</td>
                  <td>${u.denomination}</td>
                  <td>${u.location || u.city || 'N/A'}</td>
                  <td>${u.createdAt?.toDate ? format(u.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}</td>
                  <td style="font-weight:bold">${u.isApproved ? 'Approved' : 'Pending'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <h3 class="section-title">Pending Actions</h3>
        <div class="table-container">
          ${reportData.pendingActions.length > 0 ? `
            <table>
              <thead>
                <tr><th>Name</th><th>Type</th><th>Submitted Date</th></tr>
              </thead>
              <tbody>
                ${reportData.pendingActions.map(u => `
                  <tr>
                    <td style="font-weight:bold">${u.name}</td>
                    <td>${u.photoStatus === 'pending' ? 'PHOTO MODERATION' : 'PROFILE APPROVAL'}</td>
                    <td>${u.updatedAt?.toDate ? format(u.updatedAt.toDate(), 'MMM dd, yyyy') : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `<p style="font-style:italic; color:#6b7280">No pending actions at this time.</p>`}
        </div>

        <div class="footer">
          Kingdom Alliance — Confidential Admin Report | Generated ${nowStr}
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    if (!data) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatePrintHTML(data));
      printWindow.document.close();
      printWindow.focus();
      // Small timeout to ensure styles and fonts load
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current) return null;
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    return pdf;
  };

  const downloadPDF = async () => {
    const pdf = await generatePDF();
    if (pdf) {
      pdf.save(`KingdomAlliance_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    }
  };

  const handleSendEmail = async () => {
    if (!emailRecipient || !data) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRecipient)) {
      alert("Please enter a valid email address.");
      return;
    }

    setSendingEmail(true);
    try {
      const pdf = await generatePDF();
      if (!pdf) throw new Error("Could not generate PDF");
      
      const pdfBase64 = pdf.output('datauristring');

      const templateParams = {
        to_email: emailRecipient,
        report_date: format(new Date(), 'PPpp'),
        message: "Please find the Kingdom Alliance Community Health & Activity Report attached.",
        content: pdfBase64 // Note: EmailJS might have limits on large base64 attachments
      };

      // Since we don't have the actual keys, we simulate or use environment variables
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        await emailjs.send(serviceId, templateId, templateParams, publicKey);
        alert(`Report sent successfully to ${emailRecipient}`);
      } else {
        console.warn("EmailJS not fully configured. Simulating success...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert(`(Demo Mode) Report sent successfully to ${emailRecipient}`);
      }
      
      setIsEmailModalOpen(false);
      setEmailRecipient('');
    } catch (err) {
      console.error("Email sending failed:", err);
      alert("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl print:hidden"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-6xl h-full md:h-[95vh] bg-white text-slate-900 overflow-hidden flex flex-col shadow-2xl md:rounded-[2rem] print:h-auto print:static print:shadow-none print:rounded-none"
      >
        {/* Top Action Bar (Hides on Print) */}
        <div className="px-8 py-4 bg-slate-50 border-b flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
            <BarChart3 className="w-4 h-4" /> System Analytics
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print
            </button>

            <button 
              onClick={() => setIsEmailModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg flex items-center gap-2 text-sm font-bold transition-all shadow-sm"
            >
              <Mail className="w-4 h-4" /> Email Report
            </button>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors ml-4">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 print:overflow-visible print:p-0" id="report-root">
          <div ref={reportRef} className="max-w-5xl mx-auto space-y-12 bg-white p-4 md:p-8">
            
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="font-headline text-xl">Compiling Community Intelligence...</p>
              </div>
            ) : data ? (
              <>
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-2 border-slate-100 pb-8 header-container">
                  <div className="flex items-center gap-4">
                    <KingdomCrossIcon size="lg" />
                    <div>
                      <h1 className="text-4xl font-serif text-slate-900 leading-tight">Kingdom Alliance</h1>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Matrimonial Platform</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <h2 className="text-3xl font-serif text-slate-800 italic">Community Health & Activity Report</h2>
                    <p className="text-slate-500 font-bold mt-1">Generated: {format(new Date(), 'PPP p')}</p>
                    <div className="h-1.5 w-full mt-4 bg-gradient-to-r from-[#040e2a] via-[#1e3a8a] to-[#d4af37] rounded-full" />
                  </div>
                </div>

                {/* Summary Cards Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stat-cards-container">
                  <ReportStatCard 
                    label="Total Registered Users" 
                    value={data.summary.totalUsers} 
                    icon={Users} 
                    gradient="from-[#040e2a] to-[#1e3a8a]"
                  />
                  <ReportStatCard 
                    label="Pending Approvals" 
                    value={data.summary.pendingApprovals} 
                    icon={Clock} 
                    gradient="from-[#d97706] to-[#ea580c]"
                  />
                  <ReportStatCard 
                    label="Active Members Today" 
                    value={data.summary.activeToday} 
                    icon={TrendingUp} 
                    gradient="from-[#0d9488] to-[#059669]"
                  />
                  <ReportStatCard 
                    label="New Profiles (Week)" 
                    value={data.metrics.newWeek} 
                    icon={Calendar} 
                    gradient="from-[#7c3aed] to-[#4f46e5]"
                  />
                </div>

                {/* Charts Grid - 2 Column */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Gender Distribution Donut */}
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 chart-card">
                    <h3 className="font-headline text-xl mb-8 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" /> Gender Distribution
                    </h3>
                    <div className="flex items-center justify-around gap-8">
                      <DonutChart 
                        male={data.genderDist.male} 
                        female={data.genderDist.female} 
                      />
                      <div className="space-y-4">
                        <ChartLegend color="#040e2a" label="Male Grooms" count={data.genderDist.male} total={data.summary.totalUsers} />
                        <ChartLegend color="#d4af37" label="Female Brides" count={data.genderDist.female} total={data.summary.totalUsers} />
                      </div>
                    </div>
                  </div>

                  {/* Denomination Distribution */}
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 chart-card">
                    <h3 className="font-headline text-xl mb-8 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" /> Users by Denomination
                    </h3>
                    <HorizontalBarChart data={data.denomDist.slice(0, 6)} />
                  </div>

                  {/* Age Range Distribution */}
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 chart-card">
                    <h3 className="font-headline text-xl mb-8 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" /> Age Range Distribution
                    </h3>
                    <VerticalBarChart data={data.ageDist} />
                  </div>

                  {/* Growth History Line Chart */}
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 chart-card">
                    <h3 className="font-headline text-xl mb-8 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" /> New Registrations (Last 30 Days)
                    </h3>
                    <LineChart data={data.registrationHistory} />
                  </div>

                  {/* Top Locations */}
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 chart-card">
                    <h3 className="font-headline text-xl mb-8 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-indigo-600" /> Top 5 Locations
                    </h3>
                    <HorizontalBarChart data={data.topLocations} colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']} />
                  </div>

                  {/* Approval Status Breakdown */}
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 chart-card">
                    <h3 className="font-headline text-xl mb-8 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-600" /> Approval Status Overview
                    </h3>
                    <div className="flex items-center justify-around gap-8">
                      <PieChart data={data.statusBreakdown} />
                      <div className="space-y-3">
                        {data.statusBreakdown.map(s => (
                          <ChartLegend key={s.name} color={s.color} label={s.name} count={s.count} total={data.summary.totalUsers} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Engagement Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl">
                  <div className="space-y-2">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Interests Sent</p>
                    <p className="text-4xl font-serif text-[#d4af37]">{data.metrics.interests}</p>
                    <p className="text-xs text-slate-500">Member-to-member connections</p>
                  </div>
                  <div className="space-y-2 border-l border-slate-800 pl-10">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Messages Sent</p>
                    <p className="text-4xl font-serif text-[#d4af37]">{data.metrics.messages}</p>
                    <p className="text-xs text-slate-500">Unique communication threads</p>
                  </div>
                  <div className="space-y-2 border-l border-slate-800 pl-10">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Photo Queue</p>
                    <p className="text-4xl font-serif text-[#d4af37]">{data.metrics.photoPending}</p>
                    <p className="text-xs text-slate-500">Profiles awaiting moderation</p>
                  </div>
                </div>

                {/* Tables Section */}
                <div className="space-y-12 tables-section">
                  {/* Recent Registrations */}
                  <div className="space-y-6">
                    <h3 className="font-headline text-2xl text-slate-900 border-l-4 border-[#040e2a] pl-4">Recent Community Members</h3>
                    <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Gender</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Denomination</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Location</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Joined</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.recentRegistrations.map((u, i) => (
                            <tr key={u.id} className={cn("hover:bg-slate-50 transition-colors", i % 2 === 1 && "bg-[#f8fafc]")}>
                              <td className="px-6 py-4 font-bold text-slate-900">{u.name}</td>
                              <td className="px-6 py-4 text-sm text-slate-600 capitalize">{u.gender}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{u.denomination}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{u.location || 'N/A'}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {u.createdAt?.toDate ? format(u.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                                  u.isApproved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                )}>
                                  {u.isApproved ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pending Actions */}
                  <div className="space-y-6">
                    <h3 className="font-headline text-2xl text-slate-900 border-l-4 border-[#d4af37] pl-4">Critical Pending Actions</h3>
                    <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Submitted</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.pendingActions.map((u, i) => (
                            <tr key={u.id} className={cn("hover:bg-slate-50 transition-colors", i % 2 === 1 && "bg-[#f8fafc]")}>
                              <td className="px-6 py-4 font-bold text-slate-900">{u.name}</td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  {(!u.isApproved || u.approvalStatus === 'pending') && (
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">PROFILE</span>
                                  )}
                                  {u.photoStatus === 'pending' && (
                                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">PHOTO</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {u.updatedAt?.toDate ? format(u.updatedAt.toDate(), 'MMM dd, p') : 'Just now'}
                              </td>
                              <td className="px-6 py-4">
                                <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                                  Review <ChevronRight className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-2 opacity-50 print-footer">
                  <KingdomCrossIcon size="lg" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Kingdom Alliance &copy; 2026 — Confidential Institutional Report</p>
                  <p className="text-[8px] text-slate-400">{format(new Date(), 'PPpp')}</p>
                </div>
              </>
            ) : (
              <div className="h-96 flex items-center justify-center text-slate-400">
                Failed to load report data.
              </div>
            )}
          </div>
        </div>

        {/* Email Popup Overlay */}
        <AnimatePresence>
          {isEmailModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEmailModalOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-headline text-2xl text-slate-900">Send Report</h3>
                    <p className="text-sm text-slate-500">Export high-resolution PDF via email</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Recipient Email</label>
                    <input 
                      type="email"
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      placeholder="Enter recipient email address"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
                    />
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                      className="flex-1 py-4 bg-[#040e2a] text-white rounded-2xl font-bold hover:bg-[#1e3a8a] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {sendingEmail ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Mail className="w-4 h-4" /> Send Report</>}
                    </button>
                    <button 
                      onClick={() => setIsEmailModalOpen(false)}
                      className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- Report Sub-Components (Custom Charts) ---

function ReportStatCard({ label, value, icon: Icon, gradient }: any) {
  const displayValue = (value === undefined || value === null) ? "—" : value.toLocaleString();
  
  return (
    <div className={cn("relative overflow-hidden p-6 rounded-3xl text-white shadow-lg group", gradient)}>
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="relative z-10 flex flex-col gap-4">
        <div className="p-2 bg-white/20 w-fit rounded-xl">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-headline leading-none">{displayValue}</p>
        </div>
      </div>
    </div>
  );
}

function ChartLegend({ color, label, count, total }: any) {
  const percentage = Math.round((count / (total || 1)) * 100);
  return (
    <div className="flex items-center gap-4">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-4 mb-1">
          <span className="text-sm font-bold text-slate-700 truncate">{label}</span>
          <span className="text-sm font-bold text-slate-900">{count}</span>
        </div>
        <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className="h-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
      <span className="text-xs font-bold text-slate-400">{percentage}%</span>
    </div>
  );
}

function DonutChart({ male, female }: { male: number; female: number }) {
  const total = male + female || 1;
  const malePerc = (male / total) * 100;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const maleDash = (malePerc / 100) * circumference;
  
  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#d4af37" strokeWidth="18" />
        <motion.circle 
          cx="50" cy="50" r={radius} fill="none" stroke="#040e2a" strokeWidth="18" 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - maleDash }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Ratio</p>
        <p className="text-xl font-headline text-slate-900">{Math.round(malePerc)}:{Math.round(100 - malePerc)}</p>
      </div>
    </div>
  );
}

function HorizontalBarChart({ data, colors }: { data: any[], colors?: string[] }) {
  const max = Math.max(...data.map(d => d.count)) || 1;
  const defaultColors = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2'];
  
  return (
    <div className="space-y-4">
      {data.map((d, i) => {
        const percentage = (d.count / max) * 100;
        return (
          <div key={d.name} className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold px-1">
              <span className="text-slate-600">{d.name}</span>
              <span className="text-slate-900">{d.count}</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: i * 0.1, duration: 1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: colors ? colors[i % colors.length] : defaultColors[i % defaultColors.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VerticalBarChart({ data }: { data: any[] }) {
  const max = Math.max(...data.map(d => d.count)) || 1;
  // Specific colors as requested in FIX 2
  const bucketColors: Record<string, string> = {
    '18–25': '#3b82f6', // blue
    '26–30': '#10b981', // emerald
    '31–35': '#f59e0b', // amber
    '36–40': '#ef4444', // red
    '41–50': '#8b5cf6', // purple
    '50+': '#0891b2'    // cyan
  };
  
  return (
    <div className="flex items-end justify-between h-48 gap-4 pt-8">
      {data.map((d, i) => {
        const height = (d.count / max) * 100;
        const barColor = bucketColors[d.range] || '#cbd5e1';
        
        return (
          <div key={d.range} className="flex-1 flex flex-col items-center gap-3 group">
            <div className="relative w-full flex-1 flex flex-col justify-end items-center">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.1, duration: 1 }}
                className="w-full min-h-[2px] rounded-t-lg group-hover:opacity-80 transition-opacity"
                style={{ backgroundColor: barColor }}
              />
              <span className="absolute -top-6 text-[10px] font-black text-slate-900">
                {d.count}
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter text-center h-4 whitespace-nowrap">{d.range}</span>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ data }: { data: any[] }) {
  if (data.length === 0) return <div className="h-40 bg-slate-100 rounded-xl" />;
  
  const max = Math.max(...data.map(d => d.count)) || 1;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.count / max) * 80; // Margin top 20%
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="relative h-48 w-full mt-4">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Fill */}
        <motion.polyline 
          points={areaPoints}
          fill="url(#gradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1.5 }}
        />
        {/* Line */}
        <motion.polyline 
          points={points}
          fill="none"
          stroke="#d4af37"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#040e2a" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Dots on peak points (simplified) */}
      <div className="absolute inset-0 flex justify-between">
        {data.map((d, i) => (i % 5 === 0 || i === data.length - 1) && (
          <div key={i} className="flex flex-col items-center justify-end h-full">
            <span className="text-[8px] font-bold text-slate-400 rotate-45 mb-1">{d.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PieChart({ data }: { data: any[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0) || 1;
  let currentAngle = 0;
  
  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {data.map((item, i) => {
          const sliceAngle = (item.count / total) * 360;
          const largeArcFlag = sliceAngle > 180 ? 1 : 0;
          const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          const endX = 50 + 40 * Math.cos(((currentAngle + sliceAngle) * Math.PI) / 180);
          const endY = 50 + 40 * Math.sin(((currentAngle + sliceAngle) * Math.PI) / 180);
          
          const d = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
          currentAngle += sliceAngle;
          
          return (
            <motion.path 
              key={item.name}
              d={d}
              fill={item.color}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="hover:opacity-80 transition-opacity"
            />
          );
        })}
      </svg>
    </div>
  );
}
