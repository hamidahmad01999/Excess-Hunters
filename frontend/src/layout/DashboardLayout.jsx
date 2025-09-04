import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";


import React from 'react'
import Footer from "../components/Footer";

function DashboardLayout() {
  return (
    <div className="">
        <Navbar/>
        <Outlet/>
        
    </div>
  )
}

export default DashboardLayout