import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  X, TrendingUp, Users, Calendar, FileText, BarChart3, 
  Mail, Printer, MapPin, Clock, CheckCircle, ChevronRight, Loader2,
  Heart, Image, GraduationCap, Building, Church
} from 'lucide-react';
import { collection, query, where, getDocs, collectionGroup } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { KingdomCrossIcon } from '../KingdomCrossIcon';
import { cn, parseFirestoreDate } from '../../lib/utils';
import { format, subDays, isAfter } from 'date-fns';

interface AdminReportModalProps { isOpen: boolean; onClose: () => void; }

interface ReportData {
  summary: { totalUsers: number; activeToday: number; newMonth: number; pendingApprovals: number; approved: number; rejected: number; suspended: number; };
  genderDist: { male: number; female: number };
  denomDist: { name: string; count: number }[];
  ageDist: { range: string; count: number }[];
  registrationHistory: { date: string; count: number }[];
  topLocations: { name: string; count: number }[];
  statusBreakdown: { name: string; count: number; shade: string }[];
  recentRegistrations: any[];
  pendingActions: any[];
  metrics: { totalMale: number; totalFemale: number; newWeek: number; newMonth: number; pending: number; approved: number; rejected: number; suspended: number; interests: number; messages: number; photoPending: number; };
  engagement: {
    onboardingStarted: number; onboardingComplete: number; approved: number;
    withFirstInterest: number; withFirstMatch: number; withFirstMessage: number;
  };
  interests: { sent: number; accepted: number; declined: number; acceptanceRate: number; };
  profileCompleteness: { withPhoto: number; withAboutMe: number; withChurch: number; withEducation: number; withProfession: number; };
  churchAnalytics: { name: string; members: number; city: string }[];
  educationDist: { name: string; count: number }[];
  professionDist: { name: string; count: number }[];
  denomGender: { denom: string; male: number; female: number }[];
  cityDist: { name: string; count: number }[];
  shortlists: { total: number; };
  photoStats: { pending: number; approved: number; rejected: number; approvalRate: number; };
}

const SHADES = ['#111', '#333', '#555', '#777', '#999', '#bbb'];

export default function AdminReportModal({ isOpen, onClose }: AdminReportModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersSnap, interestsSnap, messagesSnap, shortlistsSnap, churchesSnap, photosSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'interests')),
        getDocs(query(collectionGroup(db, 'messages'))),
        getDocs(collection(db, 'shortlists')),
        getDocs(collection(db, 'churches')),
        getDocs(collection(db, 'photoModeration')),
      ]);

      const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() as any })).filter(u => u.role !== 'admin');
      const now = new Date();
      const currentYear = now.getFullYear();
      const weekAgo = subDays(now, 7);
      const monthAgo = subDays(now, 30);

      const totalUsers = allUsers.length;
      const approved = allUsers.filter(u => u.isApproved === true || u.approvalStatus === 'approved');
      const pending = allUsers.filter(u => u.approvalStatus === 'pending' && u.onboardingComplete === true).length;
      const rejected = allUsers.filter(u => u.approvalStatus === 'rejected').length;
      const suspended = allUsers.filter(u => u.status === 'suspended').length;
      const activeToday = approved.filter(u => { const la = parseFirestoreDate(u.lastActive); return la && format(la, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'); }).length;
      const newWeek = allUsers.filter(u => { const c = parseFirestoreDate(u.createdAt); return c && isAfter(c, weekAgo); }).length;
      const newMonth = allUsers.filter(u => { const c = parseFirestoreDate(u.createdAt); return c && isAfter(c, monthAgo); }).length;

      const maleUsers = allUsers.filter(u => u.gender === 'male');
      const femaleUsers = allUsers.filter(u => u.gender === 'female');
      const onboardingStarted = allUsers.filter(u => u.onboardingComplete === true || u.onboardingComplete === false).length;
      const onboardingComplete = allUsers.filter(u => u.onboardingComplete === true).length;

      // Interests
      const interestsData = interestsSnap.docs.map(d => d.data());
      const interestsAccepted = interestsData.filter(i => i.status === 'accepted').length;
      const interestsDeclined = interestsData.filter(i => i.status === 'declined').length;
      const interestsSent = interestsData.filter(i => i.status === 'pending').length;

      // Engagement funnel
      const userIds = new Set(allUsers.map(u => u.id));
      const interestedUserIds = new Set(interestsData.map(i => i.fromId));
      const acceptedInterests = interestsData.filter(i => i.status === 'accepted');
      const matchedUserIds = new Set();
      acceptedInterests.forEach(i => { matchedUserIds.add(i.fromId); matchedUserIds.add(i.toId); });
      const messagesData = messagesSnap.docs.map(d => d.data());
      const messagedUserIds = new Set();
      messagesData.forEach(m => { messagedUserIds.add(m.senderId); messagedUserIds.add(m.receiverId); });

      const withFirstInterest = allUsers.filter(u => interestedUserIds.has(u.id)).length;
      const withFirstMatch = allUsers.filter(u => matchedUserIds.has(u.id)).length;
      const withFirstMessage = allUsers.filter(u => messagedUserIds.has(u.id)).length;

      // Profile completeness
      const withPhoto = allUsers.filter(u => u.photoUrl && u.photoUrl.trim()).length;
      const withAboutMe = allUsers.filter(u => u.aboutMe && u.aboutMe.trim().length > 10).length;
      const withChurch = allUsers.filter(u => u.churchName && u.churchName.trim()).length;
      const withEducation = allUsers.filter(u => u.education && u.education.trim()).length;
      const withProfession = allUsers.filter(u => u.profession && u.profession.trim()).length;

      // Denomination
      const denoms: Record<string, number> = {};
      allUsers.forEach(u => { const d = u.denomination || 'Unknown'; denoms[d] = (denoms[d] || 0) + 1; });
      const denomDist = Object.entries(denoms).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

      // Denomination × Gender
      const denomGenderMap: Record<string, { male: number; female: number }> = {};
      allUsers.forEach(u => {
        const d = u.denomination || 'Unknown';
        if (!denomGenderMap[d]) denomGenderMap[d] = { male: 0, female: 0 };
        if (u.gender === 'male') denomGenderMap[d].male++;
        else if (u.gender === 'female') denomGenderMap[d].female++;
      });
      const denomGender = Object.entries(denomGenderMap).map(([denom, counts]) => ({ denom, ...counts })).sort((a, b) => (b.male + b.female) - (a.male + a.female));

      // Age
      const ages: Record<string, number> = { '18–25': 0, '26–30': 0, '31–35': 0, '36–40': 0, '41–50': 0, '50+': 0 };
      allUsers.forEach(u => {
        let ageNum = u.age;
        if (!ageNum && u.dateOfBirth) { const dob = u.dateOfBirth.toDate?.() || new Date(u.dateOfBirth); if (dob instanceof Date && !isNaN(dob.getTime())) ageNum = currentYear - dob.getFullYear(); }
        if (!ageNum) return;
        if (ageNum <= 25) ages['18–25']++; else if (ageNum <= 30) ages['26–30']++; else if (ageNum <= 35) ages['31–35']++; else if (ageNum <= 40) ages['36–40']++; else if (ageNum <= 50) ages['41–50']++; else ages['50+']++;
      });
      const ageDist = Object.entries(ages).map(([range, count]) => ({ range, count }));

      // Locations
      const locs: Record<string, number> = {};
      allUsers.forEach(u => { const l = u.cityLiving || u.location?.split(',')[0] || u.city || 'Unknown'; locs[l] = (locs[l] || 0) + 1; });
      const cityDist = Object.entries(locs).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
      const topLocations = cityDist.slice(0, 5);

      // Education
      const edus: Record<string, number> = {};
      allUsers.forEach(u => { const e = u.education || 'Unknown'; edus[e] = (edus[e] || 0) + 1; });
      const educationDist = Object.entries(edus).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

      // Profession
      const profs: Record<string, number> = {};
      allUsers.forEach(u => { const p = u.profession || 'Unknown'; profs[p] = (profs[p] || 0) + 1; });
      const professionDist = Object.entries(profs).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

      // Churches
      const churchAnalytics = churchesSnap.docs.map(d => ({ name: d.data().churchName || 'Unknown', members: d.data().members?.length || 0, city: d.data().churchCity || '' })).sort((a, b) => b.members - a.members).slice(0, 10);

      // Photo stats
      const photosData = photosSnap.docs.map(d => d.data());
      const photoApproved = photosData.filter(p => p.photoStatus === 'approved').length;
      const photoRejected = photosData.filter(p => p.photoStatus === 'rejected').length;
      const photoPendingCount = photosData.filter(p => p.photoStatus === 'pending').length;

      // Registration history
      const history: Record<string, number> = {};
      for (let i = 0; i < 30; i++) history[format(subDays(now, i), 'MMM dd')] = 0;
      allUsers.forEach(u => { const c = u.createdAt?.toDate?.(); if (c && isAfter(c, monthAgo)) { const d = format(c, 'MMM dd'); if (history[d] !== undefined) history[d]++; } });
      const registrationHistory = Object.entries(history).map(([date, count]) => ({ date, count })).reverse();

      setData({
        summary: { totalUsers, activeToday, newMonth, pendingApprovals: pending, approved: approved.length, rejected, suspended },
        genderDist: { male: maleUsers.length, female: femaleUsers.length },
        denomDist, ageDist, registrationHistory, topLocations,
        statusBreakdown: [
          { name: 'Approved', count: approved.length, shade: '#111' },
          { name: 'Pending', count: pending, shade: '#777' },
          { name: 'Rejected', count: rejected, shade: '#999' },
          { name: 'Suspended', count: suspended, shade: '#ccc' },
        ],
        recentRegistrations: allUsers.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)).slice(0, 10),
        pendingActions: allUsers.filter(u => (u.isApproved === false || u.approvalStatus === 'pending') || u.photoStatus === 'pending').slice(0, 10),
        metrics: { totalMale: maleUsers.length, totalFemale: femaleUsers.length, newWeek, newMonth, pending, approved: approved.length, rejected, suspended, interests: interestsSnap.size, messages: messagesSnap.size, photoPending: photoPendingCount },
        engagement: { onboardingStarted, onboardingComplete, approved: approved.length, withFirstInterest, withFirstMatch, withFirstMessage },
        interests: { sent: interestsSent, accepted: interestsAccepted, declined: interestsDeclined, acceptanceRate: interestsAccepted + interestsDeclined > 0 ? Math.round((interestsAccepted / (interestsAccepted + interestsDeclined)) * 100) : 0 },
        profileCompleteness: { withPhoto, withAboutMe, withChurch, withEducation, withProfession },
        churchAnalytics, educationDist, professionDist, denomGender, cityDist,
        shortlists: { total: shortlistsSnap.size },
        photoStats: { pending: photoPendingCount, approved: photoApproved, rejected: photoRejected, approvalRate: photoApproved + photoRejected > 0 ? Math.round((photoApproved / (photoApproved + photoRejected)) * 100) : 0 },
      });
    } catch (err) { console.error("Error fetching report data:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isOpen) fetchData(); }, [isOpen]);

  const generatePrintHTML = (r: ReportData) => {
    const nowStr = format(new Date(), 'PPP p');
    const t = r.summary.totalUsers || 1;
    const p = (c: number) => Math.round((c / t) * 100);
    return `<!DOCTYPE html><html><head><title>Kingdom Alliance Report</title>
    <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=Playfair+Display:wght@400;500;600&display=swap');
    @page{size:A4 portrait;margin:18mm 16mm}*{box-sizing:border-box}
    body{font-family:'Inter',sans-serif;color:#1a1a1a;line-height:1.5;margin:0;padding:0;font-size:10px;font-weight:300;letter-spacing:.01em;-webkit-print-color-adjust:exact}
    .hdr{display:flex;justify-content:space-between;align-items:flex-end;padding-bottom:12px;border-bottom:.5px solid #d4d4d4;margin-bottom:16px}
    .brand{font-size:20px;font-family:'Playfair Display',serif;font-weight:400;color:#111}
    .sub{font-size:8px;color:#888;text-transform:uppercase;letter-spacing:3.5px;font-weight:300;margin:3px 0 0}
    .date{font-size:8px;color:#999;text-transform:uppercase;letter-spacing:1.5px;font-weight:300}
    .divider{height:1px;background:#111;margin:16px 0 20px}
    .sg{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:.5px solid #e0e0e0;margin-bottom:24px;overflow:hidden}
    .sc{padding:14px 10px;text-align:center;border-right:.5px solid #e0e0e0}.sc:last-child{border-right:none}
    .sv{font-size:22px;font-weight:200;display:block;color:#111;letter-spacing:-.5px}
    .sl{font-size:7.5px;color:#888;text-transform:uppercase;letter-spacing:.15em;margin-top:4px;font-weight:400}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    th,td{padding:8px 10px;text-align:left;border-bottom:.5px solid #e8e8e8}
    th{font-size:7.5px;text-transform:uppercase;letter-spacing:.12em;font-weight:500;color:#666;border-bottom:1px solid #ccc}
    td{font-weight:300;color:#333;font-size:9.5px}tr:nth-child(even){background:#fafafa}
    .st{font-size:11px;font-weight:400;font-family:'Playfair Display',serif;margin:22px 0 10px;padding-bottom:4px;border-bottom:.5px solid #d4d4d4;color:#111}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .tc{page-break-inside:avoid;margin-bottom:16px}
    .ft{position:fixed;bottom:0;left:0;width:100%;text-align:center;font-size:7.5px;color:#aaa;font-weight:300;letter-spacing:.1em;padding-top:8px;border-top:.5px solid #e0e0e0;background:white}
    .pb{page-break-before:always}svg{vertical-align:middle}
    .funnel{display:flex;align-items:center;gap:8px;margin:12px 0}
    .fn{flex:1;text-align:center;padding:10px;border:.5px solid #e0e0e0}
    .fn .v{font-size:18px;font-weight:200;color:#111}.fn .l{font-size:7px;color:#888;text-transform:uppercase;letter-spacing:.12em;margin-top:2px}
    .arrow{color:#ccc;font-size:14px}
    </style></head><body>
    <div class="hdr"><div style="display:flex;align-items:center;gap:14px"><svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M10 2H14V8H20V12H14V22H10V12H4V8H10V2Z" fill="#111"/></svg><div><h1 class="brand">The Kingdom Alliances</h1><p class="sub">Matrimonial Platform</p></div></div><div class="date">${nowStr}</div></div>
    <div class="divider"></div>

    <div class="sg">
      <div class="sc"><span class="sv">${r.summary.totalUsers.toLocaleString()}</span><span class="sl">Total Users</span></div>
      <div class="sc"><span class="sv">${r.summary.pendingApprovals.toLocaleString()}</span><span class="sl">Pending</span></div>
      <div class="sc"><span class="sv">${r.summary.activeToday.toLocaleString()}</span><span class="sl">Active Today</span></div>
      <div class="sc"><span class="sv">${r.metrics.newWeek.toLocaleString()}</span><span class="sl">New This Week</span></div>
    </div>

    <h3 class="st">Engagement Funnel</h3>
    <div class="funnel">
      <div class="fn"><div class="v">${r.engagement.onboardingComplete}</div><div class="l">Onboarded</div></div><span class="arrow">→</span>
      <div class="fn"><div class="v">${r.engagement.approved}</div><div class="l">Approved</div></div><span class="arrow">→</span>
      <div class="fn"><div class="v">${r.engagement.withFirstInterest}</div><div class="l">Sent Interest</div></div><span class="arrow">→</span>
      <div class="fn"><div class="v">${r.engagement.withFirstMatch}</div><div class="l">Matched</div></div><span class="arrow">→</span>
      <div class="fn"><div class="v">${r.engagement.withFirstMessage}</div><div class="l">Messaged</div></div>
    </div>

    <h3 class="st">Interest Analytics</h3>
    <div class="g2">
      <div class="tc"><table><thead><tr><th>Metric</th><th>Count</th><th>%</th></tr></thead><tbody>
        <tr><td>Pending</td><td>${r.interests.sent}</td><td>${p(r.interests.sent)}%</td></tr>
        <tr><td>Accepted</td><td>${r.interests.accepted}</td><td>${p(r.interests.accepted)}%</td></tr>
        <tr><td>Declined</td><td>${r.interests.declined}</td><td>${p(r.interests.declined)}%</td></tr>
      </tbody></table></div>
      <div class="tc"><table><thead><tr><th>Platform Health</th><th>Value</th></tr></thead><tbody>
        <tr><td>Acceptance Rate</td><td>${r.interests.acceptanceRate}%</td></tr>
        <tr><td>Shortlists</td><td>${r.shortlists.total}</td></tr>
        <tr><td>Total Messages</td><td>${r.metrics.messages}</td></tr>
      </tbody></table></div>
    </div>

    <h3 class="st">Profile Completeness</h3>
    <div class="tc"><table><thead><tr><th>Field</th><th>Completed</th><th>% of Total</th></tr></thead><tbody>
      <tr><td>Photo</td><td>${r.profileCompleteness.withPhoto}</td><td>${p(r.profileCompleteness.withPhoto)}%</td></tr>
      <tr><td>About Me</td><td>${r.profileCompleteness.withAboutMe}</td><td>${p(r.profileCompleteness.withAboutMe)}%</td></tr>
      <tr><td>Church Info</td><td>${r.profileCompleteness.withChurch}</td><td>${p(r.profileCompleteness.withChurch)}%</td></tr>
      <tr><td>Education</td><td>${r.profileCompleteness.withEducation}</td><td>${p(r.profileCompleteness.withEducation)}%</td></tr>
      <tr><td>Profession</td><td>${r.profileCompleteness.withProfession}</td><td>${p(r.profileCompleteness.withProfession)}%</td></tr>
    </tbody></table></div>

    <div class="g2">
      <div><h3 class="st">Gender Distribution</h3><div class="tc"><table><thead><tr><th>Gender</th><th>Count</th><th>%</th></tr></thead><tbody>
        <tr><td>Male Grooms</td><td>${r.genderDist.male}</td><td>${p(r.genderDist.male)}%</td></tr>
        <tr><td>Female Brides</td><td>${r.genderDist.female}</td><td>${p(r.genderDist.female)}%</td></tr>
      </tbody></table></div></div>
      <div><h3 class="st">Approval Status</h3><div class="tc"><table><thead><tr><th>Status</th><th>Count</th><th>%</th></tr></thead><tbody>
        ${r.statusBreakdown.map(s => `<tr><td>${s.name}</td><td>${s.count}</td><td>${p(s.count)}%</td></tr>`).join('')}
      </tbody></table></div></div>
    </div>

    <h3 class="st">Denomination × Gender</h3>
    <div class="tc"><table><thead><tr><th>Denomination</th><th>Male</th><th>Female</th><th>Total</th></tr></thead><tbody>
      ${r.denomGender.slice(0, 8).map(d => `<tr><td>${d.denom}</td><td>${d.male}</td><td>${d.female}</td><td>${d.male + d.female}</td></tr>`).join('')}
    </tbody></table></div>

    <h3 class="st">Age Range Distribution</h3>
    <div class="tc"><table><thead><tr><th>Range</th><th>Count</th><th>%</th></tr></thead><tbody>
      ${r.ageDist.map(d => `<tr><td>${d.range}</td><td>${d.count}</td><td>${p(d.count)}%</td></tr>`).join('')}
    </tbody></table></div>

    <h3 class="st">Education & Profession</h3>
    <div class="g2">
      <div class="tc"><table><thead><tr><th>Education</th><th>Count</th></tr></thead><tbody>
        ${r.educationDist.map(d => `<tr><td>${d.name}</td><td>${d.count}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="tc"><table><thead><tr><th>Profession</th><th>Count</th></tr></thead><tbody>
        ${r.professionDist.map(d => `<tr><td>${d.name}</td><td>${d.count}</td></tr>`).join('')}
      </tbody></table></div>
    </div>

    <div class="pb"></div>

    <h3 class="st">Geographic Distribution</h3>
    <div class="tc"><table><thead><tr><th>City</th><th>Users</th><th>%</th></tr></thead><tbody>
      ${r.cityDist.slice(0, 15).map(d => `<tr><td>${d.name}</td><td>${d.count}</td><td>${p(d.count)}%</td></tr>`).join('')}
    </tbody></table></div>

    <h3 class="st">Church Directory</h3>
    <div class="tc"><table><thead><tr><th>Church</th><th>City</th><th>Members</th></tr></thead><tbody>
      ${r.churchAnalytics.map(c => `<tr><td>${c.name}</td><td>${c.city}</td><td>${c.members}</td></tr>`).join('')}
    </tbody></table></div>

    <h3 class="st">Photo Moderation</h3>
    <div class="tc"><table><thead><tr><th>Status</th><th>Count</th><th>%</th></tr></thead><tbody>
      <tr><td>Pending</td><td>${r.photoStats.pending}</td><td>${p(r.photoStats.pending)}%</td></tr>
      <tr><td>Approved</td><td>${r.photoStats.approved}</td><td>${p(r.photoStats.approved)}%</td></tr>
      <tr><td>Rejected</td><td>${r.photoStats.rejected}</td><td>${p(r.photoStats.rejected)}%</td></tr>
      <tr><td>Approval Rate</td><td colspan="2">${r.photoStats.approvalRate}%</td></tr>
    </tbody></table></div>

    <h3 class="st">Registration Activity (30 Days)</h3>
    <div class="tc"><table><thead><tr><th>Date</th><th>Signups</th></tr></thead><tbody>
      ${r.registrationHistory.filter(h => h.count > 0).map(h => `<tr><td>${h.date}</td><td>${h.count}</td></tr>`).join('') || '<tr><td colspan="2" style="font-style:italic;color:#aaa">No registrations</td></tr>'}
    </tbody></table></div>

    <h3 class="st">Recent Registrations</h3>
    <div class="tc"><table><thead><tr><th>Name</th><th>Gender</th><th>Denomination</th><th>City</th><th>Joined</th><th>Status</th></tr></thead><tbody>
      ${r.recentRegistrations.map(u => `<tr><td style="font-weight:400">${u.name}</td><td style="text-transform:capitalize">${u.gender}</td><td>${u.denomination}</td><td>${u.cityLiving || u.location || 'N/A'}</td><td>${u.createdAt?.toDate ? format(u.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}</td><td>${u.isApproved ? 'Approved' : 'Pending'}</td></tr>`).join('')}
    </tbody></table></div>

    <h3 class="st">Pending Actions</h3>
    <div class="tc">${r.pendingActions.length > 0 ? `<table><thead><tr><th>Name</th><th>Type</th><th>Submitted</th></tr></thead><tbody>
      ${r.pendingActions.map(u => `<tr><td style="font-weight:400">${u.name}</td><td>${u.photoStatus === 'pending' ? 'Photo Moderation' : 'Profile Approval'}</td><td>${u.updatedAt?.toDate ? format(u.updatedAt.toDate(), 'MMM dd, yyyy') : 'N/A'}</td></tr>`).join('')}
    </tbody></table>` : '<p style="font-style:italic;color:#aaa;font-weight:300">No pending actions.</p>'}</div>

    <div class="ft">The Kingdom Alliances — Confidential Report | ${nowStr}</div>
    </body></html>`;
  };

  const handlePrint = () => {
    if (!data) return;
    const w = window.open('', '_blank');
    if (w) { w.document.write(generatePrintHTML(data)); w.document.close(); w.focus(); setTimeout(() => w.print(), 500); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl print:hidden" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative w-full max-w-6xl h-full md:h-[95vh] bg-[#fafafa] text-[#111] overflow-hidden flex flex-col shadow-2xl md:rounded-2xl print:h-auto print:static print:shadow-none print:rounded-none">
        <div className="px-8 py-4 bg-[#fafafa] border-b border-[#e0e0e0] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-[#666] text-[13px] font-medium"><BarChart3 className="w-4 h-4" /> System Analytics</div>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="px-4 py-2 bg-white border border-[#e0e0e0] hover:bg-[#f5f5f5] rounded-lg flex items-center gap-2 text-[13px] font-medium transition-all"><Printer className="w-4 h-4" /> Print</button>
            <button onClick={onClose} className="p-2 hover:bg-[#f0f0f0] rounded-full transition-colors ml-2"><X className="w-5 h-5 text-[#666]" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 print:overflow-visible print:p-0" id="report-root">
          <div ref={reportRef} className="max-w-5xl mx-auto space-y-10 bg-white p-4 md:p-8 rounded-xl border border-[#1a2e4a]/5">
            {loading ? (
              <div className="h-96 flex flex-col items-center justify-center gap-4 text-[#888]">
                <Loader2 className="w-10 h-10 animate-spin text-[#0f172a]" />
                <p className="text-sm font-display">Compiling Community Intelligence...</p>
              </div>
            ) : data ? (
              <>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#e0e0e0] pb-6">
                  <div className="flex items-center gap-4">
                    <div data-html2canvas-ignore="true"><KingdomCrossIcon size="lg" /></div>
                    <div>
                      <h1 className="text-3xl font-display font-bold text-[#111] leading-tight tracking-tight">The Kingdom Alliances</h1>
                      <p className="text-[9px] font-medium text-[#888] uppercase tracking-[0.25em] mt-1">Matrimonial Platform — Comprehensive Report</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[9px] font-medium text-[#888] uppercase tracking-[0.15em]">Generated</p>
                    <p className="text-sm font-display font-semibold text-[#111] mt-0.5">{format(new Date(), 'PPP p')}</p>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <ReportStatCard label="Total Users" value={data.summary.totalUsers} icon={Users} />
                  <ReportStatCard label="Pending Approvals" value={data.summary.pendingApprovals} icon={Clock} />
                  <ReportStatCard label="Active Today" value={data.summary.activeToday} icon={TrendingUp} />
                  <ReportStatCard label="New This Week" value={data.metrics.newWeek} icon={Calendar} />
                </div>

                {/* Engagement Funnel */}
                <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                  <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#888]" /> Engagement Funnel
                  </h3>
                  <div className="flex items-center gap-2">
                    {[
                      { label: 'Onboarded', value: data.engagement.onboardingComplete },
                      { label: 'Approved', value: data.engagement.approved },
                      { label: 'Sent Interest', value: data.engagement.withFirstInterest },
                      { label: 'Matched', value: data.engagement.withFirstMatch },
                      { label: 'Messaged', value: data.engagement.withFirstMessage },
                    ].map((step, i, arr) => (
                      <React.Fragment key={step.label}>
                        <div className="flex-1 text-center p-3 border border-[#e0e0e0] rounded-lg">
                          <p className="text-xl font-display font-bold text-[#111]">{step.value}</p>
                          <p className="text-[8px] font-medium text-[#888] uppercase tracking-[0.12em] mt-1">{step.label}</p>
                        </div>
                        {i < arr.length - 1 && <span className="text-[#ccc] text-lg">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Charts 2-col */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                    <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2"><Users className="w-4 h-4 text-[#888]" /> Gender Distribution</h3>
                    <div className="flex items-center justify-around gap-6">
                      <DonutChart male={data.genderDist.male} female={data.genderDist.female} />
                      <div className="space-y-3">
                        <ChartLegend color="#111" label="Male Grooms" count={data.genderDist.male} total={data.summary.totalUsers} />
                        <ChartLegend color="#999" label="Female Brides" count={data.genderDist.female} total={data.summary.totalUsers} />
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                    <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#888]" /> Interest Analytics</h3>
                    <div className="space-y-4">
                      <FunnelBar label="Pending" value={data.interests.sent} total={data.interests.sent + data.interests.accepted + data.interests.declined} />
                      <FunnelBar label="Accepted" value={data.interests.accepted} total={data.interests.sent + data.interests.accepted + data.interests.declined} />
                      <FunnelBar label="Declined" value={data.interests.declined} total={data.interests.sent + data.interests.accepted + data.interests.declined} />
                      <div className="pt-3 border-t border-[#e0e0e0] flex justify-between items-center">
                        <span className="text-[10px] font-medium text-[#888] uppercase tracking-[0.12em]">Acceptance Rate</span>
                        <span className="text-lg font-display font-bold text-[#111]">{data.interests.acceptanceRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                    <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#888]" /> Denomination</h3>
                    <HorizontalBarChart data={data.denomDist.slice(0, 6)} />
                  </div>

                  <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                    <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#888]" /> Age Range</h3>
                    <VerticalBarChart data={data.ageDist} />
                  </div>

                  <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                    <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#888]" /> Top 5 Locations</h3>
                    <HorizontalBarChart data={data.topLocations} />
                  </div>

                  <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                    <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#888]" /> Registrations (30D)</h3>
                    <LineChart data={data.registrationHistory} />
                  </div>
                </div>

                {/* Profile Completeness */}
                <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                  <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#888]" /> Profile Completeness</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Photo', count: data.profileCompleteness.withPhoto },
                      { label: 'About Me', count: data.profileCompleteness.withAboutMe },
                      { label: 'Church', count: data.profileCompleteness.withChurch },
                      { label: 'Education', count: data.profileCompleteness.withEducation },
                      { label: 'Profession', count: data.profileCompleteness.withProfession },
                    ].map(f => (
                      <div key={f.label} className="text-center p-3 border border-[#e0e0e0] rounded-lg">
                        <p className="text-lg font-display font-bold text-[#111]">{Math.round((f.count / (data!.summary.totalUsers || 1)) * 100)}%</p>
                        <p className="text-[8px] font-medium text-[#888] uppercase tracking-[0.12em] mt-1">{f.label}</p>
                        <p className="text-[10px] text-[#aaa] mt-0.5">{f.count} users</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Denomination × Gender */}
                <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                  <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2"><Users className="w-4 h-4 text-[#888]" /> Denomination × Gender</h3>
                  <div className="overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="border-b border-[#e0e0e0]">
                        <tr>
                          <th className="px-4 py-2.5 text-[9px] font-medium text-[#888] uppercase tracking-[0.12em]">Denomination</th>
                          <th className="px-4 py-2.5 text-[9px] font-medium text-[#888] uppercase tracking-[0.12em] text-center">Male</th>
                          <th className="px-4 py-2.5 text-[9px] font-medium text-[#888] uppercase tracking-[0.12em] text-center">Female</th>
                          <th className="px-4 py-2.5 text-[9px] font-medium text-[#888] uppercase tracking-[0.12em] text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f0f0]">
                        {data.denomGender.slice(0, 8).map(d => (
                          <tr key={d.denom}>
                            <td className="px-4 py-2.5 text-[12px] text-[#333]">{d.denom}</td>
                            <td className="px-4 py-2.5 text-[12px] text-[#555] text-center">{d.male}</td>
                            <td className="px-4 py-2.5 text-[12px] text-[#555] text-center">{d.female}</td>
                            <td className="px-4 py-2.5 text-[12px] font-medium text-[#111] text-center">{d.male + d.female}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Education & Profession */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                    <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-[#888]" /> Education</h3>
                    <HorizontalBarChart data={data.educationDist} />
                  </div>
                  <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                    <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2"><Building className="w-4 h-4 text-[#888]" /> Profession</h3>
                    <HorizontalBarChart data={data.professionDist} />
                  </div>
                </div>

                {/* Church & Photos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                    <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2"><Church className="w-4 h-4 text-[#888]" /> Top Churches</h3>
                    <div className="space-y-3">
                      {data.churchAnalytics.slice(0, 6).map(c => (
                        <div key={c.name} className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-0">
                          <div>
                            <p className="text-[12px] font-medium text-[#111]">{c.name}</p>
                            <p className="text-[10px] text-[#888]">{c.city}</p>
                          </div>
                          <span className="text-[12px] font-semibold text-[#111] bg-[#f5f5f5] px-2 py-0.5 rounded">{c.members}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-[#1a2e4a]/8 rounded-xl p-6">
                    <h3 className="text-sm font-display font-semibold text-[#111] mb-5 flex items-center gap-2"><Image className="w-4 h-4 text-[#888]" /> Photo Moderation</h3>
                    <div className="space-y-4">
                      <FunnelBar label="Pending" value={data.photoStats.pending} total={data.photoStats.pending + data.photoStats.approved + data.photoStats.rejected} />
                      <FunnelBar label="Approved" value={data.photoStats.approved} total={data.photoStats.pending + data.photoStats.approved + data.photoStats.rejected} />
                      <FunnelBar label="Rejected" value={data.photoStats.rejected} total={data.photoStats.pending + data.photoStats.approved + data.photoStats.rejected} />
                      <div className="pt-3 border-t border-[#e0e0e0] flex justify-between items-center">
                        <span className="text-[10px] font-medium text-[#888] uppercase tracking-[0.12em]">Approval Rate</span>
                        <span className="text-lg font-display font-bold text-[#111]">{data.photoStats.approvalRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tables */}
                <div className="space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-sm font-display font-semibold text-[#111] uppercase tracking-[0.1em]">Recent Registrations</h3>
                    <div className="overflow-hidden border border-[#1a2e4a]/8 rounded-xl">
                      <table className="w-full text-left">
                        <thead className="border-b border-[#e0e0e0]">
                          <tr>
                            {['Name','Gender','Denomination','City','Joined','Status'].map(h => (
                              <th key={h} className="px-5 py-3 text-[9px] font-medium text-[#888] uppercase tracking-[0.12em]">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f0f0]">
                          {data.recentRegistrations.map(u => (
                            <tr key={u.id} className="hover:bg-[#fafafa] transition-colors">
                              <td className="px-5 py-3 text-[13px] font-medium text-[#111]">{u.name}</td>
                              <td className="px-5 py-3 text-[12px] text-[#666] capitalize">{u.gender}</td>
                              <td className="px-5 py-3 text-[12px] text-[#666]">{u.denomination}</td>
                              <td className="px-5 py-3 text-[12px] text-[#666]">{u.cityLiving || u.location || 'N/A'}</td>
                              <td className="px-5 py-3 text-[12px] text-[#666]">{u.createdAt?.toDate ? format(u.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}</td>
                              <td className="px-5 py-3"><span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", u.isApproved ? "bg-[#f0f0f0] text-[#333]" : "bg-[#f5f0e0] text-[#8a7a50]")}>{u.isApproved ? 'Approved' : 'Pending'}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-8 border-t border-[#e0e0e0] flex flex-col items-center gap-2">
                  <KingdomCrossIcon size="lg" />
                  <p className="text-[9px] font-medium text-[#888] uppercase tracking-[0.2em]">The Kingdom Alliances &copy; 2026 — Confidential Report</p>
                  <p className="text-[8px] text-[#aaa] font-medium tracking-wider">{format(new Date(), 'PPpp')}</p>
                </div>
              </>
            ) : (
              <div className="h-96 flex items-center justify-center text-[#888]">Failed to load report data.</div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Sub-Components ───

function ReportStatCard({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="p-5 bg-white border border-[#1a2e4a]/8 rounded-xl hover:border-[#1a2e4a]/15 transition-all">
      <div className="p-2 bg-[#0f172a]/5 rounded-lg w-fit mb-3"><Icon className="w-4 h-4 text-[#0f172a]/60" /></div>
      <p className="text-[10px] font-medium text-[#888] uppercase tracking-[0.15em]">{label}</p>
      <p className="text-[28px] font-display font-bold text-[#111] leading-none mt-1 tracking-tight">{(value ?? 0).toLocaleString()}</p>
    </div>
  );
}

function FunnelBar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] font-medium text-[#555]">{label}</span>
        <span className="text-[11px] font-semibold text-[#111]">{value}</span>
      </div>
      <div className="w-full h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-[#111] rounded-full" />
      </div>
    </div>
  );
}

function ChartLegend({ color, label, count, total }: { color: string; label: string; count: number; total: number }) {
  const pct = Math.round((count / (total || 1)) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline gap-3 mb-1">
          <span className="text-[12px] font-medium text-[#333] truncate">{label}</span>
          <span className="text-[12px] font-semibold text-[#111]">{count}</span>
        </div>
        <div className="w-28 h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full" style={{ backgroundColor: color }} />
        </div>
      </div>
      <span className="text-[10px] font-medium text-[#888]">{pct}%</span>
    </div>
  );
}

function DonutChart({ male, female }: { male: number; female: number }) {
  const total = male + female || 1;
  const malePerc = (male / total) * 100;
  const r = 35, c = 2 * Math.PI * r;
  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e0e0e0" strokeWidth="16" />
        <motion.circle cx="50" cy="50" r={r} fill="none" stroke="#111" strokeWidth="16" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (malePerc / 100) * c }} transition={{ duration: 1.5, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-[10px] font-medium text-[#888] uppercase tracking-tighter">Ratio</p>
        <p className="text-lg font-display font-bold text-[#111]">{Math.round(malePerc)}:{Math.round(100 - malePerc)}</p>
      </div>
    </div>
  );
}

function HorizontalBarChart({ data }: { data: { name: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count)) || 1;
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.name} className="space-y-1">
          <div className="flex justify-between text-[11px] px-1">
            <span className="font-medium text-[#555] truncate">{d.name}</span>
            <span className="font-semibold text-[#111]">{d.count}</span>
          </div>
          <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(d.count / max) * 100}%` }} transition={{ delay: i * 0.08, duration: 0.8 }} className="h-full rounded-full bg-[#111]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function VerticalBarChart({ data }: { data: { range: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count)) || 1;
  return (
    <div className="flex items-end justify-between h-40 gap-3 pt-6">
      {data.map((d, i) => {
        const h = (d.count / max) * 100;
        return (
          <div key={d.range} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="relative w-full flex-1 flex flex-col justify-end items-center">
              <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.08, duration: 0.8 }} className="w-full min-h-[2px] rounded-t bg-[#111] group-hover:bg-[#333] transition-colors" />
              <span className="absolute -top-5 text-[9px] font-semibold text-[#111]">{d.count}</span>
            </div>
            <span className="text-[8px] font-medium text-[#888] uppercase tracking-tight text-center whitespace-nowrap">{d.range}</span>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ data }: { data: { date: string; count: number }[] }) {
  if (!data.length) return <div className="h-40 bg-[#f5f5f5] rounded-xl" />;
  const max = Math.max(...data.map(d => d.count)) || 1;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.count / max) * 80}`).join(' ');
  return (
    <div className="relative h-40 w-full mt-2">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.polyline points={`0,100 ${pts} 100,100`} fill="#111" fillOpacity={0.05} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
        <motion.polyline points={pts} fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: "easeInOut" }} />
      </svg>
    </div>
  );
}
