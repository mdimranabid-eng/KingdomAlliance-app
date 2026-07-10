import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Search, Printer, Church, Phone, MapPin, Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChurchRecord {
  churchCity: string;
  churchArea: string;
  churchName: string;
  pastorName: string;
  pastorNumber: string;
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
        const querySnapshot = await getDocs(collection(db, 'users'));
        const rawRecords: ChurchRecord[] = [];
        
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const churchName = (data.churchName || '').trim();
          const churchCity = (data.churchCity || '').trim();
          const churchArea = (data.churchArea || '').trim();
          const pastorName = (data.pastorName || '').trim();
          const pastorNumber = (data.pastorNumber || '').trim();

          // Only include if at least one field has data
          if (churchName || churchCity || churchArea || pastorName || pastorNumber) {
            rawRecords.push({
              churchCity,
              churchArea,
              churchName,
              pastorName,
              pastorNumber,
            });
          }
        });

        // Deduplicate records based on all 5 fields
        const uniqueMap = new Map<string, ChurchRecord>();
        rawRecords.forEach((rec) => {
          const uniqueKey = `${rec.churchName.toLowerCase()}||${rec.churchCity.toLowerCase()}||${rec.churchArea.toLowerCase()}||${rec.pastorName.toLowerCase()}||${rec.pastorNumber}`;
          if (!uniqueMap.has(uniqueKey)) {
            uniqueMap.set(uniqueKey, rec);
          }
        });

        setRecords(Array.from(uniqueMap.values()));
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
        @media print {
          body {
            background: white !important;
            color: black !important;
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
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #cbd5e1 !important;
            padding: 8px !important;
            text-align: left !important;
            font-size: 12px !important;
          }
          th {
            background-color: #f1f5f9 !important;
            color: black !important;
            font-weight: bold !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-headline text-4xl text-on-surface font-bold">Church Directory</h1>
            <p className="text-on-surface-variant">View and print unique church & pastor details from user profiles</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2.5 px-6 py-3 bg-[#040e2a] hover:bg-[#040e2a]/90 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Printer className="w-5 h-5" />
          Print / Save PDF
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative no-print">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Search by church name, city, area, pastor name or number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-surface border border-outline-variant rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all text-on-surface"
        />
      </div>

      {/* Pagination Controls - Below Search Bar */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print bg-surface-container-low px-6 py-3.5 rounded-2xl border border-outline-variant">
          <div className="text-sm text-on-surface-variant font-medium">
            Showing <span className="font-semibold text-on-surface">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
            <span className="font-semibold text-on-surface">
              {Math.min(currentPage * itemsPerPage, filteredRecords.length)}
            </span>{" "}
            of <span className="font-semibold text-on-surface">{filteredRecords.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 bg-surface hover:bg-surface-container rounded-xl border border-outline-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all text-on-surface"
              title="Previous Page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-on-surface px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 bg-surface hover:bg-surface-container rounded-xl border border-outline-variant disabled:opacity-50 disabled:cursor-not-allowed transition-all text-on-surface"
              title="Next Page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Printable Report Header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-slate-900 border-b-2 border-slate-900 pb-2">
          Kingdom Alliance - Church Directory Report
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Generated on: {new Date().toLocaleDateString()} | Total Unique Churches: {filteredRecords.length}
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-on-surface-variant animate-pulse font-medium">Loading records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant rounded-3xl p-16 text-center shadow-sm">
          <Church className="w-16 h-16 text-on-surface-variant mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-on-surface mb-2">No Records Found</h3>
          <p className="text-on-surface-variant">There are no church records matching your search criteria.</p>
        </div>
      ) : (
        <>
          {/* Main Paginated Screen Table */}
          <div className="bg-surface rounded-3xl border border-outline-variant overflow-hidden shadow-sm print:hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4.5 font-bold text-on-surface text-sm uppercase tracking-wider">Church Name</th>
                    <th className="px-6 py-4.5 font-bold text-on-surface text-sm uppercase tracking-wider">City</th>
                    <th className="px-6 py-4.5 font-bold text-on-surface text-sm uppercase tracking-wider">Area</th>
                    <th className="px-6 py-4.5 font-bold text-on-surface text-sm uppercase tracking-wider">Pastor Name</th>
                    <th className="px-6 py-4.5 font-bold text-on-surface text-sm uppercase tracking-wider">Pastor Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {displayedRecords.map((rec, index) => (
                    <tr key={index} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4 text-on-surface font-semibold text-sm">
                        <div className="flex items-center gap-3">
                          <Church className="w-4 h-4 text-primary" />
                          {rec.churchName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-on-surface-variant/70" />
                          {rec.churchCity || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant text-sm">{rec.churchArea || 'N/A'}</td>
                      <td className="px-6 py-4 text-on-surface font-medium text-sm">{rec.pastorName || 'N/A'}</td>
                      <td className="px-6 py-4 text-on-surface-variant text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-on-surface-variant/70" />
                          {rec.pastorNumber || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full Printing Table (renders entire matched list without pagination for full PDF output) */}
          <div className="hidden print:block print-full-width">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2 font-bold text-sm uppercase">Church Name</th>
                  <th className="px-3 py-2 font-bold text-sm uppercase">City</th>
                  <th className="px-3 py-2 font-bold text-sm uppercase">Area</th>
                  <th className="px-3 py-2 font-bold text-sm uppercase">Pastor Name</th>
                  <th className="px-3 py-2 font-bold text-sm uppercase">Pastor Number</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 font-semibold text-xs">{rec.churchName || 'N/A'}</td>
                    <td className="px-3 py-2 text-xs">{rec.churchCity || 'N/A'}</td>
                    <td className="px-3 py-2 text-xs">{rec.churchArea || 'N/A'}</td>
                    <td className="px-3 py-2 font-medium text-xs">{rec.pastorName || 'N/A'}</td>
                    <td className="px-3 py-2 text-xs">{rec.pastorNumber || 'N/A'}</td>
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
