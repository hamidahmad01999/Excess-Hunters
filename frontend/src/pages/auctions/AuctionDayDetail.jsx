import React, { useEffect, useState } from "react";
import api from "../../utils/api.js";
import Loader from "../../components/Loader.jsx";


export function AuctionDayDetails({ date }) {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuctionsByDate = async () => {
      setLoading(true);
      try {
        const res = await api.get(`${import.meta.env.VITE_API_BASE_URL}/auctions-by-date`, {
          params: { date },
          withCredentials: true,
        });

        if (res?.status === 200) {
          const fetchedAuctions = res?.data?.auctions || [];
          setAuctions(fetchedAuctions);
          if (fetchedAuctions.length === 0) {
            // No toast here since it's handled by Auctions.jsx
            setError("No auctions available for this day.");
          } else {
            setError("");
          }
        } else {
          setError(res?.data?.message || "Failed to fetch auctions");
        }
      } catch (err) {
        const errMsg = err.response?.data?.message || "Something went wrong while fetching auctions";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionsByDate();
  }, [date]);

  if (loading) return <Loader />;

  if (error) {
    return <div className="text-center text-red-500 text-lg font-medium mt-8">{error}</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-6 md:mb-8 text-center">
        Auctions for {date}
      </h1>
      <div className="max-w-4xl mx-auto space-y-6">
        {auctions.length > 0 ? (
          auctions.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 line-clamp-1">
                {item.PropertyAddress}
              </h2>
              <p className="text-sm md:text-base text-gray-500 font-medium mb-4">{item.AuctionType}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base text-gray-700">
                <p><strong>Case No:</strong> {item.CaseNo}</p>
                <p><strong>Judgement:</strong> ${item.FinalJudgementAmount}</p>
                <p><strong>Parcel ID:</strong> {item.ParcelID}</p>
                <p><strong>Date:</strong> {item.AuctionDate.split(" ")[0]}</p>
                <p className="col-span-1 md:col-span-2">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-3 py-1 rounded-full text-white text-xs md:text-sm font-medium ${item.AuctionStatus.includes("Canceled") ? "bg-red-500" : "bg-green-500"}`}
                  >
                    {item.AuctionStatus}
                  </span>
                </p>
              </div>
              <a
                href={item.Link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 md:mt-5 text-teal-500 hover:text-teal-600 font-medium transition-colors duration-200"
              >
                View Details →
              </a>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600 text-lg font-medium">No auctions available for this day.</div>
        )}
      </div>
    </div>
  );
}