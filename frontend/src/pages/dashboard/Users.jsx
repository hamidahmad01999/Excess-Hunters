import React, { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import Loader from "../../components/Loader";
import api from "../../utils/api.js"
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function Users({ setActiveTab, selectedUserId, setSelectedUserId }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();


  const handleRemove = async (id) => {
    setLoading(true);
    try {
      const res = await api.delete(`${import.meta.env.VITE_API_BASE_URL}/users/${id}`, {
        withCredentials: true,
      });
      if (res.status === 200) {
        toast.success("User deleted successfully!");
        setUsers(users.filter((user) => user.id !== id));
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        if (err.response.status === 401) {
          toast.error("You are not authorized to delete user!");
        } else {
          toast.error("Something went wrong!");
        }
        console.error(err.response.data?.message || "Deletion failed");
      } else {
        toast.error("Network error. Please check your connection.");
        console.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const openConfirmation = (id) => {
    setSelectedUserId(id);
    setShowConfirm(true);
  };

  const confirmYes = () => {
    handleRemove(selectedUserId);
    setShowConfirm(false);
    setSelectedUserId(null);
  };

  const confirmNo = () => {
    setShowConfirm(false);
    setSelectedUserId(null);
  };

  useEffect(() => {
    setLoading(true);
    const fetchUsers = async () => {
      try {
        const res = await api.get(`${import.meta.env.VITE_API_BASE_URL}/users`, {
          withCredentials: true,
        });
        setUsers(res?.data?.users || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch users!");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-6">
        All Users
      </h2>

      <div className="relative overflow-x-auto bg-white rounded-2xl shadow-lg">
        <div className="md:min-w-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-teal-500 text-white">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold sm:px-6 sm:py-4 w-[10%]">Sr #</th>
                <th className="px-4 py-3 text-sm font-semibold sm:px-6 sm:py-4 w-[25%]">Name</th>
                <th className="hidden sm:table-cell px-4 py-3 text-sm font-semibold sm:px-6 sm:py-4 w-[20%]">Date of Birth</th>
                <th className="hidden sm:table-cell px-4 py-3 text-sm font-semibold sm:px-6 sm:py-4 w-[30%]">Email</th>
                <th className="px-4 py-3 text-sm font-semibold sm:px-6 sm:py-4 w-[15%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.length > 0 ? (
                users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`transition-all duration-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-teal-50`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-600 sm:px-6 sm:py-4">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 sm:px-6 sm:py-4 truncate max-w-[100px] sm:max-w-[150px]">
                      {user?.username.length > 15 ? user.username.slice(0, 15) + "..." : user.username}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-600 sm:px-6 sm:py-4">
                      {new Date(user?.dob).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-600 sm:px-6 sm:py-4 truncate max-w-[120px] sm:max-w-[200px]">
                      {user?.email.length > 20 ? user.email.slice(0, 20) + "..." : user.email}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setActiveTab("EditUser");
                          setSelectedUserId(user.id);
                        }}
                        className="p-2 text-teal-500 hover:text-teal-600 rounded-lg transition-all duration-200 hover:bg-teal-100 flex items-center gap-2 shadow-sm"
                        aria-label={`Edit user ${user.username}`}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => openConfirmation(user?.id)}
                        className="p-2 text-red-500 hover:text-red-600 rounded-lg transition-all duration-200 hover:bg-red-100 flex items-center gap-2 shadow-sm"
                        aria-label={`Delete user ${user.username}`}
                      >
                        <FaTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-3 text-center text-gray-600 sm:px-6 sm:py-4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md sm:max-w-lg text-center">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button
                onClick={confirmYes}
                className="px-4 py-2 bg-teal-500 text-white text-sm sm:text-base font-medium rounded-lg shadow-sm hover:bg-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
                aria-label="Confirm delete user"
              >
                Yes, Delete
              </button>
              <button
                onClick={confirmNo}
                className="px-4 py-2 bg-gray-300 text-gray-800 text-sm sm:text-base font-medium rounded-lg shadow-sm hover:bg-gray-400 focus:ring-2 focus:ring-gray-300/20 transition-all duration-200"
                aria-label="Cancel delete user"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
