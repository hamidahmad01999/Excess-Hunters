// Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
    FaBars,
    FaTimes,
    FaUser,
    FaUsers,
    FaHome,
    FaRobot
} from "react-icons/fa";
import Users from "./Users";
import Register from "../register/Register";
import EditUser from "./EditUser";
import Overview from "./Overview";
import { useAuth } from "../../context/AuthContext";
import Scraper from "./Scraper";

export default function Dashboard() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false); // Closed by default on mobile
    const [activeTab, setActiveTab] = useState("Overview");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const toggleSidebar = () => setIsOpen(!isOpen);



    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div
                className={`fixed md:relative z-30 transition-all duration-300 bg-white shadow-lg h-full
        ${isOpen ? "w-64" : "w-0 md:w-64"} overflow-hidden`}
            >
                {/* Top area inside sidebar */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden text-gray-600 hover:text-gray-900"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                <nav className="mt-4">
                    <SidebarItem
                        icon={<FaHome />}
                        text="Overview"
                        active={activeTab === "Overview"}
                        onClick={() => {
                            setActiveTab("Overview");
                            if (window.innerWidth < 768) setIsOpen(false); // Close after click on mobile
                        }}
                    />
                    <SidebarItem
                        icon={<FaUsers />}
                        text="Users"
                        active={activeTab === "Users"}
                        onClick={() => {
                            setActiveTab("Users");
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                    />
                    <SidebarItem
                        icon={<FaUser />}
                        text="Register User"
                        active={activeTab === "Register User"}
                        onClick={() => {
                            setActiveTab("Register User");
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                    />
                    <SidebarItem
                        icon={<FaRobot />}
                        text="Scraper"
                        active={activeTab === "Scraper"}
                        onClick={() => {
                            setActiveTab("Scraper");
                            if (window.innerWidth < 768) setIsOpen(false);
                        }}
                    />
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Top bar */}
                <header className="flex items-center justify-between bg-white shadow p-4">
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden text-gray-600 hover:text-gray-900"
                    >
                        <FaBars size={20} />
                    </button>
                    <div className="flex justify-between w-[100%] pr-4">
                        <h2 className="text-lg font-semibold">{activeTab}</h2>
                        <h2 className="text-lg font-semibold">Hello {user?.name}</h2>

                    </div>
                </header>

                {/* Content area */}
                <main className="p-6 flex-1 overflow-y-auto bg-white">
                    {activeTab === "Overview" && <Overview />}
                    {activeTab === "Users" && <Users setActiveTab={setActiveTab} selectedUserId={selectedUserId} setSelectedUserId={setSelectedUserId} />}
                    {activeTab === "Register User" && <Register />}
                    {activeTab === "Scraper" && <Scraper />}
                    {activeTab === "EditUser" && <EditUser userId={selectedUserId} setActiveTab={setActiveTab} />}
                </main>
            </div>
        </div>
    );
}

function SidebarItem({ icon, text, active, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 px-6 py-4 cursor-pointer transition-colors
        ${active ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"}`}
        >
            <span className="text-lg">{icon}</span>
            <span className="text-md font-medium">{text}</span>
        </div>
    );
}

/* Dummy Components */
// function Overview() {
//     return <h1 className="text-2xl font-bold">Overview Content</h1>;
// }

// function Users() {
//   return <h1 className="text-2xl font-bold">Users Content</h1>;
// }

// function RegisterUser() {
//   return <h1 className="text-2xl font-bold">Register User Content</h1>;
// }

// function Scraper() {
//     return <h1 className="text-2xl font-bold">Scraper Content</h1>;
// }
