import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };
  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/logout`,
        { withCredentials: true }
      );
      toast.success("Logout sucessfull!")
      logout();
    } catch (err) {
      if (err.response) {
        toast.error("Something went wrong");
      } else {
        toast.error("Network error. Please check your connection.");

      }
    }
  };
  return (
    <nav className="bg-neutral-100 shadow-lg px-4 py-3 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="text-xl font-bold text-blue-600">
        <NavLink
          to=""

        >
          Excess Hunters
        </NavLink>
      </div>

      {/* Center: Desktop Menu */}
      <ul className="hidden md:flex space-x-6">
        <li>
          <NavLink
            to=""
            className={({ isActive }) =>
              `transition-colors ${isActive ? "text-teal-700 font-semibold" : "text-gray-700 hover:text-teal-700"
              }`
            }
          >
            Home
          </NavLink>
        </li>
        {
          user && (
            <NavLink
              to="/auctions"
              className={({ isActive }) =>
                `transition-colors ${isActive ? "text-teal-700 font-semibold" : "text-gray-700 hover:text-teal-700"
                }`
              }
            >
              Auctions
            </NavLink>
          )
        }
        {
          user?.role === "admin" && (
            <li>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `transition-colors ${isActive ? "text-teal-700 font-semibold" : "text-gray-700 hover:text-teal-700"
                  }`
                }
              >
                Dashboard
              </NavLink>
            </li>
          )
        }

      </ul>

      {/* Right: Logout Button */}
      {
        user ?
          <div className="hidden md:block">
            <button onClick={handleLogout} className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors">
              Logout
            </button>
          </div>
          :
          <div className="hidden md:block">
            <button onClick={() => navigate("/login")} className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md transition-colors">
              Login
            </button>
          </div>
      }


      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu}>
          <FaBars className="text-2xl text-gray-700" />
        </button>
      </div>

      {/* Mobile/Tablet Full Screen Menu */}
      {menuOpen && (
        <div className="fixed inset-0 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-8 transition-all duration-200">
          {/* Close Button */}
          <button
            className="absolute top-6 right-6 text-3xl text-gray-700 hover:text-teal-700 transition-colors"
            onClick={toggleMenu}
          >
            <FaTimes />
          </button>

          <NavLink
            to=""
            className={({ isActive }) =>
              `text-2xl transition-colors ${isActive ? "text-teal-700 font-semibold" : "text-gray-700 hover:text-teal-700"
              }`
            }
            onClick={() => setMenuOpen(false)}
          >
            Home
          </NavLink>
          {
            user && (
              <NavLink
                to="/auctions"
                className={({ isActive }) =>
                  `text-2xl transition-colors ${isActive ? "text-teal-700 font-semibold" : "text-gray-700 hover:text-teal-700"
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                Auctions
              </NavLink>
            )
          }
          {
            user?.role === "admin" && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `text-2xl transition-colors ${isActive ? "text-teal-700 font-semibold" : "text-gray-700 hover:text-teal-700"
                  }`
                }
                onClick={() => {
                  setMenuOpen(false)
                }}
              >
                Dashboard
              </NavLink>
            )
          }

          {
            user ?
              <button
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-3 rounded-md transition-colors"
                onClick={() => {
                  setMenuOpen(false)
                  handleLogout();


                }}
              >
                Logout
              </button> :
              <button
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-3 rounded-md transition-colors"
                onClick={() => {
                  navigate("/login")
                }}
              >
                Login
              </button>

          }

        </div>
      )}
    </nav>
  );
};

export default Navbar;
