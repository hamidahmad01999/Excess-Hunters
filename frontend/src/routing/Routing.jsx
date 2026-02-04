// routing/Routing.jsx
import React from 'react';
import { Route, createBrowserRouter, createRoutesFromElements } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider
import Layout from '../layout/Layout';
import Login from '../pages/login/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import EditUser from '../pages/dashboard/EditUser';
import Auctions from '../pages/auctions/Auctions';
import ProtectedRoute from '../pages/auth/ProtectedRoute';
import Home from '../pages/home/Home';
import DashboardLayout from '../layout/DashboardLayout';
import { AuctionDayDetails } from '../pages/auctions/AuctionDayDetail';
import AuctionWrapper from '../pages/auctions/AuctionWraper';
import NotFound from '../pages/not_found/NotFound';

export const router = createBrowserRouter(
    createRoutesFromElements(
        [<Route
            path='/'
            element={
                <AuthProvider>
                    <Layout />
                </AuthProvider>
            }
            errorElement={<NotFound />}   // ✅ add error handler here
        >
            <Route path="" element={<Login />} />
            {/* <Route
                path="/dashboard"
                element={
                    <ProtectedRoute admin={true}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            /> */}
            <Route path="/user/:id" element={<EditUser />} />
            {/* <Route path="" element={<Home />} /> */}
            <Route
                path="/auctions"
                element={
                    <ProtectedRoute>
                        <AuctionWrapper />
                    </ProtectedRoute>
                }
            />
            <Route path="/auctions-detail/" element={<AuctionDayDetails />}/>
        </Route>,
        <Route
            element={
                <AuthProvider>
                    <DashboardLayout />
                </AuthProvider>
            }
            errorElement={<NotFound />}   // ✅ also here
        >
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute admin={true}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
        </Route>
        ]
    ) 
);
