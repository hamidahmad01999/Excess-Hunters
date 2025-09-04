import React, { useEffect, useState } from "react";
import { FaPlay, FaClock, FaCheckCircle, FaTimesCircle, FaCalendarAlt } from "react-icons/fa";
import api from "../../utils/api.js"
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ScraperDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lastRunTime, setLastRunTime] = useState(null);
  const [lastAuctionsInserted, setLastAuctionsInserted] = useState(0);
  const [lastRunStatus, setLastRunStatus] = useState("Success");
  const [lastErrorMessage, setLastErrorMessage] = useState("");
  const [nextRunTime, setNextRunTime] = useState("");
  const [dailyRunTime, setDailyRunTime] = useState("");
  const [nextRunFrom, setNextRunFrom] = useState("");
  const [nextRunTo, setNextRunTo] = useState("");
  const [dailyRunFrom, setDailyRunFrom] = useState("");
  const [dailyRunTo, setDailyRunTo] = useState("");
  const [lastRunTimeStr, setLastRunTimeStr]=useState("");
  const [nextRunTimeStr, setNextRunTimeStr]=useState("");
  const [dailyRunTimeStr, setDailyRunTimeStr] = useState("");

  // Handle 401 unauthorized event

  // Fetch scraper details
  useEffect(() => {
    const fetchScraperDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`${import.meta.env.VITE_API_BASE_URL}/scraper/details`, {
          withCredentials: true,
        });
        if (res.data?.success) {
          setLastRunTime(res.data.last_run_time ?? "N/A");
          setLastRunTimeStr(res.data.last_run_time)
          setNextRunTimeStr(res.data.next_run_time)
          setDailyRunTimeStr(res.data.daily_run_time)
          setLastAuctionsInserted(res.data.last_auctions_inserted ?? 0);
          setLastRunStatus(res.data.last_run_status ?? "Unknown");
          setLastErrorMessage(res.data.last_error_message ?? "");
          setNextRunTime(res.data.next_run_time ? new Date(res.data.next_run_time).toISOString().slice(0, 16) : "");
          setDailyRunTime(res.data.daily_run_time ?? "");
          setNextRunFrom(res.data.next_run_from ? new Date(res.data.next_run_from).toISOString().slice(0, 10) : "");
          setNextRunTo(res.data.next_run_to ? new Date(res.data.next_run_to).toISOString().slice(0, 10) : "");
          setDailyRunFrom(res.data.daily_run_from ? new Date(res.data.daily_run_from).toISOString().slice(0, 10) : "");
          setDailyRunTo(res.data.daily_run_to ? new Date(res.data.daily_run_to).toISOString().slice(0, 10) : "");
        } else {
          toast.error(res.data?.message ?? "Failed to fetch scraper details");
        }
      } catch (err) {
        toast.error("Error fetching scraper details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchScraperDetails();
  }, []);

  const handleStartScraper = async () => {
    setLoading(true);
    try {
      const res = await api.post(`${import.meta.env.VITE_API_BASE_URL}/scraper/start`, {}, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success("Scraper started successfully!");
        // Refresh details
        const refreshRes = await api.get(`${import.meta.env.VITE_API_BASE_URL}/scraper/details`, {
          withCredentials: true,
        });
        if (refreshRes.data?.success) {
          setLastRunTimeStr(res.data.last_run_time)
          setNextRunTimeStr(res.data.next_run_time)
          setDailyRunTimeStr(res.data.daily_run_time)
          setLastRunTime(refreshRes.data.last_run_time ?? "N/A");
          setLastAuctionsInserted(refreshRes.data.last_auctions_inserted ?? 0);
          setLastRunStatus(refreshRes.data.last_run_status ?? "Unknown");
          setLastErrorMessage(refreshRes.data.last_error_message ?? "");
          setNextRunTime(refreshRes.data.next_run_time ? new Date(refreshRes.data.next_run_time).toISOString().slice(0, 16) : "");
          setDailyRunTime(refreshRes.data.daily_run_time ?? "");
          setNextRunFrom(refreshRes.data.next_run_from ? new Date(refreshRes.data.next_run_from).toISOString().slice(0, 10) : "");
          setNextRunTo(refreshRes.data.next_run_to ? new Date(refreshRes.data.next_run_to).toISOString().slice(0, 10) : "");
          setDailyRunFrom(refreshRes.data.daily_run_from ? new Date(refreshRes.data.daily_run_from).toISOString().slice(0, 10) : "");
          setDailyRunTo(refreshRes.data.daily_run_to ? new Date(refreshRes.data.daily_run_to).toISOString().slice(0, 10) : "");
        }
      } else {
        toast.error(res.data?.message ?? "Failed to start scraper");
      }
    } catch (err) {
      if(err.response.status===400){
        toast.error(err.response.message);
      }else{
        toast.error("Error starting scraper");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetSchedule = async () => {
    if (!dailyRunTime && !nextRunTime) {
      toast.error("Please select a daily run time or next run time");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`${import.meta.env.VITE_API_BASE_URL}/scraper/schedule`, {
        next_run_time: nextRunTime || undefined,
        daily_run_time: dailyRunTime || undefined,
      }, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success("Schedule updated successfully!");
        // Refresh details
        const refreshRes = await api.get(`${import.meta.env.VITE_API_BASE_URL}/scraper/details`, {
          withCredentials: true,
        });
        if (refreshRes.data?.success) {
          setLastRunTimeStr(res.data.last_run_time)
          setNextRunTimeStr(res.data.next_run_time)
          setDailyRunTimeStr(res.data.daily_run_time)
          setLastRunTime(refreshRes.data.last_run_time ?? "N/A");
          setLastAuctionsInserted(refreshRes.data.last_auctions_inserted ?? 0);
          setLastRunStatus(refreshRes.data.last_run_status ?? "Unknown");
          setLastErrorMessage(refreshRes.data.last_error_message ?? "");
          setNextRunTime(refreshRes.data.next_run_time ? new Date(refreshRes.data.next_run_time).toISOString().slice(0, 16) : "");
          setDailyRunTime(refreshRes.data.daily_run_time ?? "");
          setNextRunFrom(refreshRes.data.next_run_from ? new Date(refreshRes.data.next_run_from).toISOString().slice(0, 10) : "");
          setNextRunTo(refreshRes.data.next_run_to ? new Date(refreshRes.data.next_run_to).toISOString().slice(0, 10) : "");
          setDailyRunFrom(refreshRes.data.daily_run_from ? new Date(refreshRes.data.daily_run_from).toISOString().slice(0, 10) : "");
          setDailyRunTo(refreshRes.data.daily_run_to ? new Date(refreshRes.data.daily_run_to).toISOString().slice(0, 10) : "");
        }
      } else {
        toast.error(res.data?.message ?? "Failed to update schedule");
      }
    } catch (err) {
      if(err.response.status===400){
        toast.error(err.response.message);
      }else{
        toast.error("Error starting scraper");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetNextRunRange = async () => {
    if (!nextRunFrom && !nextRunTo) {
      toast.error("Please select at least one date for next run range");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`${import.meta.env.VITE_API_BASE_URL}/scraper/next_run_range`, {
        next_run_from: nextRunFrom || undefined,
        next_run_to: nextRunTo || undefined,
      }, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success("Next run range updated successfully!");
        // Refresh details
        const refreshRes = await api.get(`${import.meta.env.VITE_API_BASE_URL}/scraper/details`, {
          withCredentials: true,
        });
        if (refreshRes.data?.success) {
          setLastRunTimeStr(res.data.last_run_time)
          setNextRunTimeStr(res.data.next_run_time)
          setDailyRunTimeStr(res.data.daily_run_time)
          setLastRunTime(refreshRes.data.last_run_time ?? "N/A");
          setLastAuctionsInserted(refreshRes.data.last_auctions_inserted ?? 0);
          setLastRunStatus(refreshRes.data.last_run_status ?? "Unknown");
          setLastErrorMessage(refreshRes.data.last_error_message ?? "");
          setNextRunTime(refreshRes.data.next_run_time ? new Date(refreshRes.data.next_run_time).toISOString().slice(0, 16) : "");

          setDailyRunTime(refreshRes.data.daily_run_time ?? "");
          setNextRunFrom(refreshRes.data.next_run_from ? new Date(refreshRes.data.next_run_from).toISOString().slice(0, 10) : "");
          setNextRunTo(refreshRes.data.next_run_to ? new Date(refreshRes.data.next_run_to).toISOString().slice(0, 10) : "");
          setDailyRunFrom(refreshRes.data.daily_run_from ? new Date(refreshRes.data.daily_run_from).toISOString().slice(0, 10) : "");
          setDailyRunTo(refreshRes.data.daily_run_to ? new Date(refreshRes.data.daily_run_to).toISOString().slice(0, 10) : "");
        }
      } else {
        toast.error(res.data?.message ?? "Failed to update next run range");
      }
    } catch (err) {
      toast.error("Error updating next run range");
      
    } finally {
      setLoading(false);
    }
  };

  const handleSetDailyRunRange = async () => {
    if (!dailyRunFrom && !dailyRunTo) {
      toast.error("Please select at least one date for daily run range");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`${import.meta.env.VITE_API_BASE_URL}/scraper/daily_run_range`, {
        daily_run_from: dailyRunFrom || undefined,
        daily_run_to: dailyRunTo || undefined,
      }, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success("Daily run range updated successfully!");
        // Refresh details
        const refreshRes = await api.get(`${import.meta.env.VITE_API_BASE_URL}/scraper/details`, {
          withCredentials: true,
        });
        if (refreshRes.data?.success) {
          setLastRunTimeStr(res.data.last_run_time)
          setNextRunTimeStr(res.data.next_run_time)
          setDailyRunTimeStr(res.data.daily_run_time)
          setLastRunTime(refreshRes.data.last_run_time ?? "N/A");
          setLastAuctionsInserted(refreshRes.data.last_auctions_inserted ?? 0);
          setLastRunStatus(refreshRes.data.last_run_status ?? "Unknown");
          setLastErrorMessage(refreshRes.data.last_error_message ?? "");
          setNextRunTime(refreshRes.data.next_run_time ? new Date(refreshRes.data.next_run_time).toISOString().slice(0, 16) : "");
          
          setDailyRunTime(refreshRes.data.daily_run_time ?? "");
          setNextRunFrom(refreshRes.data.next_run_from ? new Date(refreshRes.data.next_run_from).toISOString().slice(0, 10) : "");
          setNextRunTo(refreshRes.data.next_run_to ? new Date(refreshRes.data.next_run_to).toISOString().slice(0, 10) : "");
          setDailyRunFrom(refreshRes.data.daily_run_from ? new Date(refreshRes.data.daily_run_from).toISOString().slice(0, 10) : "");
          setDailyRunTo(refreshRes.data.daily_run_to ? new Date(refreshRes.data.daily_run_to).toISOString().slice(0, 10) : "");
        }
      } else {
        toast.error(res.data?.message ?? "Failed to update daily run range");
      }
    } catch (err) {
      toast.error("Error updating daily run range");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight text-center">
          Scraper Control Panel
        </h1>
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Scraper Status</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center space-x-3">
              <FaClock className="text-teal-500 text-xl sm:text-2xl" />
              <div>
                <p className="text-sm font-medium text-gray-500">Last Run Time</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {lastRunTimeStr || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCheckCircle className="text-teal-500 text-xl sm:text-2xl" />
              <div>
                <p className="text-sm font-medium text-gray-500">Auctions Inserted</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {lastAuctionsInserted}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className={`text-xl sm:text-2xl ${lastRunStatus === "Success" ? "text-green-500" : "text-red-500"
                  }`}
              >
                {lastRunStatus === "Success" ? <FaCheckCircle /> : <FaTimesCircle />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {lastRunStatus}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="text-teal-500 text-xl sm:text-2xl" />
              <div>
                <p className="text-sm font-medium text-gray-500">Next Run Time</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {nextRunTimeStr || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="text-teal-500 text-xl sm:text-2xl" />
              <div>
                <p className="text-sm font-medium text-gray-500">Daily Run Time</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {dailyRunTimeStr || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="text-teal-500 text-xl sm:text-2xl" />
              <div>
                <p className="text-sm font-medium text-gray-500">Next Run From</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {nextRunFrom ? new Date(nextRunFrom).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="text-teal-500 text-xl sm:text-2xl" />
              <div>
                <p className="text-sm font-medium text-gray-500">Next Run To</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {nextRunTo ? new Date(nextRunTo).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="text-teal-500 text-xl sm:text-2xl" />
              <div>
                <p className="text-sm font-medium text-gray-500">Daily Run From</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {dailyRunFrom ? new Date(dailyRunFrom).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FaCalendarAlt className="text-teal-500 text-xl sm:text-2xl" />
              <div>
                <p className="text-sm font-medium text-gray-500">Daily Run To</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {dailyRunTo ? new Date(dailyRunTo).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            {lastErrorMessage && (
              <div className="col-span-full mt-4 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">Error: {lastErrorMessage}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleStartScraper}
            className="px-6 py-3 bg-teal-500 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            aria-label="Start scraper"
          >
            <FaPlay />
            <span>Start Scraper Now</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            Schedule Scraper
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="next_run_time"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Next Run Time
              </label>
              <input
                type="datetime-local"
                id="next_run_time"
                value={nextRunTime}
                onChange={(e) => setNextRunTime(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                aria-label="Select next run date and time for scraper"
              />
            </div>
            <div>
              <label
                htmlFor="daily_run_time"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Daily Run Time
              </label>
              <input
                type="time"
                id="daily_run_time"
                value={dailyRunTime}
                onChange={(e) => setDailyRunTime(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                aria-label="Select daily run time for scraper"
              />
            </div>

            <div>
              <label
                htmlFor="next_run_from"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Next Run From
              </label>
              <input
                type="date"
                id="next_run_from"
                value={nextRunFrom}
                onChange={(e) => setNextRunFrom(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                aria-label="Select om date"
              />
            </div>
            <div>
              <label
                htmlFor="next_run_to"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Next Run To
              </label>
              <input
                type="date"
                id="next_run_to"
                value={nextRunTo}
                onChange={(e) => setNextRunTo(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                aria-label="Select next run to date"
              />
            </div>
            <div>
              <label
                htmlFor="daily_run_from"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Daily Run From
              </label>
              <input
                type="date"
                id="daily_run_from"
                value={dailyRunFrom}
                onChange={(e) => setDailyRunFrom(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                aria-label="Select daily run from date"
              />
            </div>
            <div>
              <label
                htmlFor="daily_run_to"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Daily Run To
              </label>
              <input
                type="date"
                id="daily_run_to"
                value={dailyRunTo}
                onChange={(e) => setDailyRunTo(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                aria-label="Select daily run to date"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={handleSetSchedule}
              className="px-6 py-3 bg-teal-500 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || (!dailyRunTime && !nextRunTime)}
              aria-label="Save scraper schedule"
            >
              Save Schedule
            </button>
            <button
              onClick={handleSetNextRunRange}
              className="px-6 py-3 bg-teal-500 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || (!nextRunFrom && !nextRunTo)}
              aria-label="Save next run range"
            >
              Save Next Run Range
            </button>
            <button
              onClick={handleSetDailyRunRange}
              className="px-6 py-3 bg-teal-500 text-white text-sm sm:text-base font-medium rounded-lg shadow-md hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || (!dailyRunFrom && !dailyRunTo)}
              aria-label="Save daily run range"
            >
              Save Daily Run Range
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}