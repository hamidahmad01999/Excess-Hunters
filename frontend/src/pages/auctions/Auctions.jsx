import React, { useEffect, useState } from "react";
import { FaTh, FaTable } from "react-icons/fa";
import Pagination from "../../components/Pagination";
import api from "../../utils/api.js"
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";



export default function Auctions() {
  const [viewMode, setViewMode] = useState("tiles");
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
  const itemsPerPage = 10; // Matches backend's items_per_page

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

        const auctionsStat = await api.get(`${import.meta.env.VITE_API_BASE_URL}/auctions-status`,
          { withCredentials: true, }
        );

        if (auctionsStat?.status === 200) {
          const filteredStatuses = auctionsStat.data.auction_status.filter(s => s !== "");
          setAuctionStatus(filteredStatuses);
        }
        
        if (res?.status === 200) {
          setAuctions(res?.data?.auctions || []);
          setTotalPages(res?.data?.total_pages || 1);
          setError("");
        } else {
          setError(res?.data?.message || "Failed to fetch auctions");
          toast.error(res?.data?.message || "Failed to fetch auctions");
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
        responseType: 'blob', // Important for file download
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



  if (loading) return <Loader />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-center">
          <div className="flex items-center justify-between mb-8 px-4 sm:px-0 w-full md:w-[90%]">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              🏠 Auction Listings
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setViewMode("tiles")}
                className={`p-3 rounded-full transition-all duration-200 transform hover:scale-105 hover:bg-teal-50 ${viewMode === "tiles" ? "bg-teal-500 text-white" : "bg-white text-gray-700 shadow-sm"
                  }`}
                title="Tile View"
              >
                <FaTh size={20} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-3 rounded-full transition-all duration-200 transform hover:scale-105 hover:bg-teal-50 ${viewMode === "table" ? "bg-teal-500 text-white" : "bg-white text-gray-700 shadow-sm"
                  }`}
                title="Table View"
              >
                <FaTable size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-8">
          <div className="w-full md:w-[90%] bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Filter Auctions</h2>

            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="auction_type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  {/* Add more auction types as needed */}
                </select>
              </div>
              <div>
                <label
                  htmlFor="auction_status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  {/* Default option */}
                  <option value="">All Statuses</option>

                  {/* Dynamic options */}
                  {auctionStatus.map((status, index) => (
                    <option key={index} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

              </div>
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <label
                  htmlFor="date_from"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <label
                  htmlFor="date_to"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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

        {/* Error Message */}
        {error && (
          <div className="text-center text-red-500 text-sm font-medium mb-6">
            {error}
          </div>
        )}

        {/* Tile View */}
        <div className="flex justify-center">
          {viewMode === "tiles" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full md:w-[90%]">
              {auctions.length > 0 ? (
                auctions.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-md p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 line-clamp-1">
                      {item.PropertyAddress}
                    </h2>
                    <p className="text-sm text-gray-500 font-medium">{item.AuctionType}</p>
                    <div className="mt-4 space-y-2 text-sm text-gray-700">
                      <p>
                        <strong>Case No:</strong> {item.CaseNo}
                      </p>
                      <p>
                        <strong>Judgement:</strong> ${item.FinalJudgementAmount}
                      </p>
                      <p>
                        <strong>Parcel ID:</strong> {item.ParcelID}
                      </p>
                      <p>
                        <strong>Date:</strong> {item.AuctionDate.split(" ")[0]}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          className={`px-3 py-1 rounded-full text-white text-xs font-medium ${item.AuctionStatus.includes("Canceled") ? "bg-red-500" : "bg-green-500"
                            }`}
                        >
                          {item.AuctionStatus}
                        </span>
                      </p>
                    </div>
                    <a
                      href={item.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-5 text-teal-500 hover:text-teal-600 font-medium transition-colors duration-200"
                    >
                      View Details →
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-600 col-span-full">No auctions available.</div>
              )}
            </div>
          )}
        </div>

        {/* Table View */}
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
                            className={`inline-flex px-3 py-1 rounded-full text-white text-xs font-medium ${item.AuctionStatus.includes("Canceled") ? "bg-red-500" : "bg-green-500"
                              }`}
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
        </div>
        {/* Pagination */}
        <div className="flex justify-center pb-4 my-3">
          <div className="flex justify-between w-full md:w-[90%]">
            <button
              onClick={handleDownloadAuctions}
              className="px-6 py-1 bg-teal-500 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 transition-all duration-200 cursor-pointer"
              aria-label="Download auctions as CSV"
            >
              Download Auctions
            </button>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </div>
  );
}

