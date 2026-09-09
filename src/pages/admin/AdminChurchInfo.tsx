import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Search, Printer, Church, Phone, MapPin, Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChurchRecord {
  id: string;
  churchCity: string;
  churchArea: string;
  churchName: string;
  pastorName: string;
  pastorNumber: string;
  members?: string[];
}

export default function AdminChurchInfo() {
  const [records, setRecords] = useState<ChurchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const itemsPerPage = 15;

  useEffect(() => {
    async function fetchChurchInfo() {
      try {
        const querySnapshot = await getDocs(collection(db, 'churches'));
        const records: ChurchRecord[] = querySnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            churchCity: (data.churchCity || '').trim(),
            churchArea: (data.churchArea || '').trim(),
            churchName: (data.churchName || '').trim(),
            pastorName: (data.pastorName || '').trim(),
            pastorNumber: (data.pastorNumber || '').trim(),
            members: data.members || [],
          };
        }).filter(r => r.churchName || r.churchCity || r.churchArea || r.pastorName || r.pastorNumber);

        setRecords(records);
      } catch (err) {
        console.error('Error fetching church records:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChurchInfo();
  }, []);

  // Reset to first page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredRecords = records.filter((rec) => {
    const term = searchTerm.toLowerCase();
    return (
      rec.churchName.toLowerCase().includes(term) ||
      rec.churchCity.toLowerCase().includes(term) ||
      rec.churchArea.toLowerCase().includes(term) ||
      rec.pastorName.toLowerCase().includes(term) ||
      rec.pastorNumber.includes(term)
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const displayedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 p-1 md:p-4 print:p-0">
      {/* Print Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap');
        @media print {
          @page { size: A4 portrait; margin: 18mm 16mm; }
          body {
            background: white !important;
            color: #1a1a1a !important;
            font-family: 'Inter', -apple-system, sans-serif !important;
            font-weight: 300 !important;
            font-size: 10px !important;
            letter-spacing: 0.01em !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-header {
            display: block !important;
            margin-bottom: 20px !important;
          }
          .print-header-brand {
            font-size: 20px !important;
            font-family: 'Playfair Display', serif !important;
            font-weight: 400 !important;
            color: #111 !important;
            letter-spacing: -0.3px !important;
          }
          .print-header-sub {
            font-size: 8px !important;
            color: #888 !important;
            text-transform: uppercase !important;
            letter-spacing: 3.5px !important;
            font-weight: 300 !important;
            margin: 3px 0 0 !important;
          }
          .print-header-date {
            font-size: 8px !important;
            color: #999 !important;
            text-transform: uppercase !important;
            letter-spacing: 1.5px !important;
            font-weight: 300 !important;
          }
          .print-divider {
            height: 1px !important;
            width: 100% !important;
            background: #111 !important;
            margin: 12px 0 16px !important;
          }
          .print-footer {
            display: block !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            text-align: center !important;
            font-size: 7.5px !important;
            color: #aaa !important;
            font-weight: 300 !important;
            letter-spacing: 0.1em !important;
            padding-top: 8px !important;
            border-top: 0.5px solid #e0e0e0 !important;
            background: white !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border-bottom: 0.5px solid #e8e8e8 !important;
            padding: 8px 10px !important;
            text-align: left !important;
            font-size: 9.5px !important;
            font-weight: 300 !important;
            color: #333 !important;
          }
          th {
            font-size: 7.5px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.12em !important;
            font-weight: 500 !important;
            color: #666 !important;
            border-bottom: 1px solid #ccc !important;
            background: transparent !important;
          }
          tr:nth-child(even) {
            background: #fafafa !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="mt-1 p-2 hover:bg-[#1a2e4a]/5 rounded-full transition-colors text-[#64748b]"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[28px] font-semibold text-[#0f172a] tracking-tight">Church Directory</h1>
            <p className="text-sm text-[#64748b] mt-0.5">View and print church &amp; pastor details from user profiles</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a2e4a] hover:bg-[#0f1d32] text-white rounded-xl text-[13px] font-medium transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* Search Filter */}
      <div className="admin-card p-4 no-print">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search by church name, city, area, pastor name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl text-[13px] ring-1 ring-black/[0.06] focus:ring-2 focus:ring-[#1a2e4a]/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="admin-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="text-[13px] text-[#64748b]">
            Showing <span className="font-medium text-[#0f172a]">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
            <span className="font-medium text-[#0f172a]">
              {Math.min(currentPage * itemsPerPage, filteredRecords.length)}
            </span>{" "}
            of <span className="font-medium text-[#0f172a]">{filteredRecords.length}</span> entries
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-white hover:bg-[#f1f5f9] rounded-lg ring-1 ring-black/[0.06] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#0f172a]" />
            </button>
            <span className="text-[13px] font-medium text-[#0f172a] px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-white hover:bg-[#f1f5f9] rounded-lg ring-1 ring-black/[0.06] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[#0f172a]" />
            </button>
          </div>
        </div>
      )}

      {/* Printable Report Header */}
      <div className="hidden print:block mb-6 print-header">
        <div className="flex items-center gap-3 mb-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M10 2H14V8H20V12H14V22H10V12H4V8H10V2Z" fill="#111" />
          </svg>
          <div>
            <h1 className="print-header-brand">Kingdom Alliance</h1>
            <p className="print-header-sub">Church Directory</p>
          </div>
        </div>
        <div className="print-divider"></div>
        <p className="print-header-date">Generated: {new Date().toLocaleDateString()} &nbsp;|&nbsp; Total Churches: {filteredRecords.length}</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-[#1a2e4a] animate-spin" />
          <p className="text-sm text-[#64748b]">Loading records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="admin-card p-16 text-center">
          <Church className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#0f172a] mb-1">No Records Found</h3>
          <p className="text-sm text-[#64748b]">No church records match your search criteria.</p>
        </div>
      ) : (
        <>
          {/* Main Paginated Screen Table */}
          <div className="admin-card overflow-hidden print:hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="border-b border-black/[0.04]">
                  <tr>
                    <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Church Name</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">City</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Area</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Pastor</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Contact</th>
                    <th className="px-5 py-3 text-[11px] font-semibold text-[#64748b] uppercase tracking-wider text-right">Members</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03]">
                  {displayedRecords.map((rec, index) => (
                    <tr key={index} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-5 py-3.5 text-[#0f172a] font-medium text-[13px]">
                        <div className="flex items-center gap-2.5">
                          <Church className="w-4 h-4 text-[#1a2e4a]/40" />
                          {rec.churchName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#64748b] text-[13px]">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#94a3b8]" />
                          {rec.churchCity || 'N/A'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#64748b] text-[13px]">{rec.churchArea || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-[#0f172a] font-medium text-[13px]">{rec.pastorName || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-[#64748b] text-[13px]">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[#94a3b8]" />
                          {rec.pastorNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-[12px] font-medium text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-md">
                          {rec.members?.length || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full Printing Table */}
          <div className="hidden print:block print-full-width">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2 font-normal text-[7.5px] uppercase tracking-[0.12em] text-[#666] border-b border-[#ccc]">Church Name</th>
                  <th className="px-3 py-2 font-normal text-[7.5px] uppercase tracking-[0.12em] text-[#666] border-b border-[#ccc]">City</th>
                  <th className="px-3 py-2 font-normal text-[7.5px] uppercase tracking-[0.12em] text-[#666] border-b border-[#ccc]">Area</th>
                  <th className="px-3 py-2 font-normal text-[7.5px] uppercase tracking-[0.12em] text-[#666] border-b border-[#ccc]">Pastor Name</th>
                  <th className="px-3 py-2 font-normal text-[7.5px] uppercase tracking-[0.12em] text-[#666] border-b border-[#ccc]">Pastor Number</th>
                  <th className="px-3 py-2 font-normal text-[7.5px] uppercase tracking-[0.12em] text-[#666] border-b border-[#ccc]">Members</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 font-normal text-[9.5px] text-[#333] border-b border-[#e8e8e8]">{rec.churchName || 'N/A'}</td>
                    <td className="px-3 py-2 text-[9.5px] text-[#333] border-b border-[#e8e8e8]">{rec.churchCity || 'N/A'}</td>
                    <td className="px-3 py-2 text-[9.5px] text-[#333] border-b border-[#e8e8e8]">{rec.churchArea || 'N/A'}</td>
                    <td className="px-3 py-2 text-[9.5px] text-[#333] border-b border-[#e8e8e8]">{rec.pastorName || 'N/A'}</td>
                    <td className="px-3 py-2 text-[9.5px] text-[#333] border-b border-[#e8e8e8]">{rec.pastorNumber || 'N/A'}</td>
                    <td className="px-3 py-2 text-[9.5px] text-[#333] border-b border-[#e8e8e8]">{rec.members?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
