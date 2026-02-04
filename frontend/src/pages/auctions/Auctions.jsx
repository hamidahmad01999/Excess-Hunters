import React, { useEffect, useState } from "react";
import { FaTable, FaCalendar, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import Pagination from "../../components/Pagination";
import api from "../../utils/api.js";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import './Auctions.css';
import { useAuth } from "../../context/AuthContext.jsx";

export default function Auctions({ onDateClick }) {
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [auctionStatus, setAuctionStatus] = useState([]);
  const [filters, setFilters] = useState({
    auction_type: "",
    auction_status: "",
    date_from: "",
    date_to: "",
    search: "",
  });
  const [tempFilters, setTempFilters] = useState({
    auction_type: "",
    auction_status: "",
    date_from: "",
    date_to: "",
    search: "",
  });
  const [calendarData, setCalendarData] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();
  const { saveDate } = useAuth();

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const res = await api.get(`${import.meta.env.VITE_API_BASE_URL}/auctions`, {
          params: {
            page: currentPage,
            auction_type: filters.auction_type || undefined,
            auction_status: filters.auction_status || undefined,
            date_from: filters.date_from || undefined,
            date_to: filters.date_to || undefined,
            search: filters.search || undefined,
          },
          withCredentials: true,
        });

        const auctionsStat = await api.get(`${import.meta.env.VITE_API_BASE_URL}/auctions-status`, {
          withCredentials: true,
        });

        const counts = await api.get(`${import.meta.env.VITE_API_BASE_URL}/auction_counts`, {
          params: {
            auction_type: filters.auction_type || undefined,
            auction_status: filters.auction_status || undefined,
            date_from: filters.date_from || undefined,
            date_to: filters.date_to || undefined,
            search: filters.search || undefined,
          },
        });

        if (auctionsStat?.status === 200) {
          const filteredStatuses = auctionsStat.data.auction_status.filter(s => s !== "");
          setAuctionStatus(filteredStatuses);
        }

        if (res?.status === 200 && counts?.status === 200) {
          setAuctions(res?.data?.auctions || []);
          setTotalPages(res?.data?.total_pages || 1);
          setError("");
          const formattedCounts = {};
          Object.keys(counts.data).forEach(date => {
            const [month, day, year] = date.split('/');
            formattedCounts[`${month}/${day}/${year}`] = counts.data[date];
          });
          setCalendarData(formattedCounts);
        } else {
          setError(res?.data?.message || counts?.data?.error || "Failed to fetch auctions");
          toast.error(res?.data?.message || counts?.data?.error || "Failed to fetch auctions");
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Not authorized to access auctions");
          toast.error("Not authorized to access auctions!");
        } else {
          setError(err.response?.data?.message || "Something went wrong while fetching auctions");
          toast.error("Something went wrong while fetching auctions");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [currentPage, filters]);

  const handleDownloadAuctions = async () => {
    try {
      const params = new URLSearchParams({
        auction_type: filters.auction_type || '',
        auction_status: filters.auction_status || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        search: filters.search || '',
      });
      const response = await api.get(`${import.meta.env.VITE_API_BASE_URL}/auctions/download?${params}`, {
        withCredentials: true,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auctions_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Auctions downloaded successfully!");
    } catch (err) {
      toast.error("Error downloading auctions");
      console.error(err);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const changeMonth = (increment) => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + increment)));
  };

  const isToday = (day, month, year) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const renderCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day bg-gray-50 cursor-default"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${monthStr}/${dayStr}/${year}`;
      const count = calendarData[dateStr] || 0;
      const today = isToday(day, month, year);

      days.push(
        <div
          key={dateStr}
          className={`calendar-day bg-white flex flex-col items-end p-4 min-h-[9rem] cursor-pointer transition-colors duration-200 relative ${count > 0 ? 'hover:bg-teal-50' : ''} ${today ? 'bg-blue-50 border border-blue-500 rounded' : ''}`}
          onClick={() => {
            if (count > 0) {
              onDateClick(new Date(`${monthStr}/${dayStr}/${year}`));
            } else {
              toast.error("No auctions available for this day!");
            }
          }}
        >
          <span className="day-number text-lg font-medium text-gray-900 absolute top-3 right-3">{day}</span>
          {count > 0 && (
            <div className="auction-count text-sm font-normal text-white bg-teal-500 rounded-full px-2 py-1 mt-10 self-start">
              {count} {count === 1 ? 'Auction' : 'Auctions'}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 md:p-8">
        <div className="flex justify-center">
          <div className="flex items-center justify-between mb-8 px-4 sm:px-0 w-full md:w-[90%]">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              🏠 Auction Listings
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setViewMode("table")}
                className={`p-3 rounded-full transition-all duration-200 cursor-pointer transform hover:scale-105 hover:bg-teal-50 ${viewMode === "table" ? "bg-teal-500 text-white" : "bg-white text-gray-700 shadow-sm"}`}
                title="Table View"
              >
                <FaTable size={20} />
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`p-3 rounded-full transition-all duration-200 transform hover:scale-105 cursor-pointer hover:bg-teal-50 ${viewMode === "calendar" ? "bg-teal-500 text-white" : "bg-white text-gray-700 shadow-sm"}`}
                title="Calendar View"
              >
                <FaCalendar size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="w-full md:w-[90%] bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Filter Auctions</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="auction_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Auction Type
                </label>
                <select
                  id="auction_type"
                  name="auction_type"
                  value={tempFilters.auction_type}
                  onChange={(e) =>
                    setTempFilters((prev) => ({ ...prev, auction_type: e.target.value }))
                  }
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 hover:bg-gray-100"
                  aria-label="Select auction type"
                >
                  <option value="">All Types</option>
                  <option value="FORECLOSURE">Foreclosure</option>
                </select>
              </div>
              <div>
                <label htmlFor="auction_status" className="block text-sm font-medium text-gray-700 mb-1">
                  Auction Status
                </label>
                <select
                  id="auction_status"
                  name="auction_status"
                  value={tempFilters.auction_status}
                  onChange={(e) =>
                    setTempFilters((prev) => ({ ...prev, auction_status: e.target.value }))
                  }
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 hover:bg-gray-100"
                  aria-label="Select auction status"
                >
                  <option value="">All Statuses</option>
                  {auctionStatus.map((status, index) => (
                    <option key={index} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search (Address, Case No, Parcel ID)
                </label>
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={tempFilters.search}
                  onChange={(e) =>
                    setTempFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  placeholder="Enter address, case number, or parcel ID"
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 hover:bg-gray-100"
                  aria-label="Search by address, case number, or parcel ID"
                />
              </div>
              <div>
                <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  id="date_from"
                  name="date_from"
                  value={tempFilters.date_from}
                  onChange={(e) =>
                    setTempFilters((prev) => ({ ...prev, date_from: e.target.value }))
                  }
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 hover:bg-gray-100"
                  aria-label="Select start date for auction filter"
                />
              </div>
              <div>
                <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  id="date_to"
                  name="date_to"
                  value={tempFilters.date_to}
                  onChange={(e) =>
                    setTempFilters((prev) => ({ ...prev, date_to: e.target.value }))
                  }
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 hover:bg-gray-100"
                  aria-label="Select end date for auction filter"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setTempFilters({
                        auction_type: "",
                        auction_status: "",
                        date_from: "",
                        date_to: "",
                        search: "",
                      });
                      setFilters({
                        auction_type: "",
                        auction_status: "",
                        date_from: "",
                        date_to: "",
                        search: "",
                      });
                      setCurrentPage(1);
                    }}
                    className="text-sm font-medium text-teal-500 hover:text-teal-600 transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => {
                      setFilters(tempFilters);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-center text-red-500 text-sm font-medium mb-6">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          {viewMode === "table" && (
            <div className="overflow-x-auto w-full md:w-[90%]">
              <table className="min-w-full bg-white rounded-lg shadow-md">
                <thead className="bg-teal-500 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Property</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Case No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Judgement</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Parcel ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auctions.length > 0 ? (
                    auctions.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-teal-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 text-gray-900">{item.PropertyAddress}</td>
                        <td className="px-6 py-4 text-gray-700">{item.AuctionType}</td>
                        <td className="px-6 py-4 text-gray-700">{item.CaseNo}</td>
                        <td className="px-6 py-4 text-gray-700">${item.FinalJudgementAmount}</td>
                        <td className="px-6 py-4 text-gray-700">{item.ParcelID}</td>
                        <td className="px-6 py-4 text-gray-700">{item.AuctionDate.split(" ")[0]}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-white text-xs font-medium ${item.AuctionStatus.includes("Canceled") ? "bg-red-500" : "bg-green-500"}`}
                          >
                            {item.AuctionStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={item.Link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-500 hover:text-teal-600 font-medium transition-colors duration-200"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-600">
                        No auctions available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {viewMode === "calendar" && (
            <div className="w-full md:w-[90%] bg-white rounded-2xl shadow-lg p-6">
              <div className="calendar-header flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-2xl">
                <button
                  onClick={() => changeMonth(-1)}
                  className="nav-button flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
                  aria-label="Previous month"
                >
                  <FaAngleLeft size={20} />
                </button>
                <h2 className="calendar-title text-xl font-semibold text-gray-900">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => changeMonth(1)}
                  className="nav-button flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200"
                  aria-label="Next month"
                >
                  <FaAngleRight size={20} />
                </button>
              </div>
              <div className="calendar-grid grid grid-cols-7 gap-px bg-gray-200 rounded-b-2xl overflow-hidden">
                <div className="calendar-day-header bg-gray-100 text-gray-700 text-sm font-medium text-center py-3">Sun</div>
                <div className="calendar-day-header bg-gray-100 text-gray-700 text-sm font-medium text-center py-3">Mon</div>
                <div className="calendar-day-header bg-gray-100 text-gray-700 text-sm font-medium text-center py-3">Tue</div>
                <div className="calendar-day-header bg-gray-100 text-gray-700 text-sm font-medium text-center py-3">Wed</div>
                <div className="calendar-day-header bg-gray-100 text-gray-700 text-sm font-medium text-center py-3">Thu</div>
                <div className="calendar-day-header bg-gray-100 text-gray-700 text-sm font-medium text-center py-3">Fri</div>
                <div className="calendar-day-header bg-gray-100 text-gray-700 text-sm font-medium text-center py-3">Sat</div>
                {renderCalendarDays()}
              </div>
            </div>
          )}
        </div>

        {viewMode === "table" && (
          <div className="flex justify-center pb-4 my-3">
            <div className="flex flex-col sm:flex-row justify-between w-full md:w-[90%]">
              <button
                onClick={handleDownloadAuctions}
                className="px-6 py-1 bg-teal-500 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 transition-all duration-200 cursor-pointer min-h-[40px]"
                aria-label="Download auctions as CSV"
              >
                Download Auctions
              </button>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}