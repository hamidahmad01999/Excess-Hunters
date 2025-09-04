
import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaGavel, FaSignInAlt, FaSignOutAlt, FaTachometerAlt, FaChartBar } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";


export default function Footer() {
  const { user, logout } = useAuth();

  return (
    <footer className="bg-white text-gray-700 py-8 border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Company Name/Logo */}
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-extrabold text-teal-500 tracking-tight">
              AuctionHub
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Your trusted platform for real estate auctions
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2 font-medium transition-colors duration-200 ${
                  isActive ? "text-teal-600" : "text-teal-500 hover:text-teal-600"
                }`
              }
            >
              <FaHome size={16} />
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/auctions"
              className={({ isActive }) =>
                `flex items-center space-x-2 font-medium transition-colors duration-200 ${
                  isActive ? "text-teal-600" : "text-teal-500 hover:text-teal-600"
                }`
              }
            >
              <FaGavel size={16} />
              <span>Auctions</span>
            </NavLink>
            {user ? (
              <>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-teal-500 hover:text-teal-600 font-medium transition-colors duration-200"
                >
                  <FaSignOutAlt size={16} />
                  <span>Logout</span>
                </button>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `flex items-center space-x-2 font-medium transition-colors duration-200 ${
                      isActive ? "text-teal-600" : "text-teal-500 hover:text-teal-600"
                    }`
                  }
                >
                  <FaChartBar size={16} />
                  <span>Dashboard</span>
                </NavLink>
                {user.isAdmin && (
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      `flex items-center space-x-2 font-medium transition-colors duration-200 ${
                        isActive ? "text-teal-600" : "text-teal-500 hover:text-teal-600"
                      }`
                    }
                  >
                    <FaTachometerAlt size={16} />
                    <span>Dashboard</span>
                  </NavLink>
                )}
              </>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center space-x-2 font-medium transition-colors duration-200 ${
                    isActive ? "text-teal-600" : "text-teal-500 hover:text-teal-600"
                  }`
                }
              >
                <FaSignInAlt size={16} />
                <span>Login</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="mt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} AuctionHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
