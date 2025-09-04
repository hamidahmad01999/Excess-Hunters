
import React, { useState, useEffect } from "react";
import api from "../../utils/api.js"
import toast from "react-hot-toast";
import Loader from "../../components/Loader";
import { FaUsers, FaGavel } from "react-icons/fa";

const Overview = () => {
  const [data, setData] = useState({ total_users: 0, total_auctions: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const res = await api.get(`${import.meta.env.VITE_API_BASE_URL}/analysis`, {
          withCredentials: true, // send HttpOnly cookie
        });
        if (res.status === 200) {
          setData({
            total_users: res.data.total_users,
            total_auctions: res.data.total_auctions,
          });
        } else {
          setError(res.data.message);
          toast.error(res.data.message || "Failed to fetch data");
        }
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error("Not allowed to call this!");
        } else {
          toast.error("Something went wrong");
          setError(err.response?.data?.message || "An error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="bg-gray-50 py-12 px-4 md:px-8 rounded-2xl">
      <div className="container mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center tracking-tight mb-10">
          Dashboard Overview
        </h2>
        {error && (
          <div className="mb-6 text-center text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
        <div className="flex flex-wrap gap-6 justify-center">
          {/* Tile: Total Users */}
          <div className="flex-1 min-w-[200px] max-w-[300px] bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-center mb-4">
              <FaUsers className="text-teal-500 text-4xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center">Total Users</h3>
            <p className="text-4xl font-bold text-teal-500 text-center mt-2">{data.total_users}</p>
          </div>

          {/* Tile: Total Auctions */}
          <div className="flex-1 min-w-[200px] max-w-[300px] bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-center mb-4">
              <FaGavel className="text-teal-500 text-4xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center">Total Auctions</h3>
            <p className="text-4xl font-bold text-teal-500 text-center mt-2">{data.total_auctions}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
