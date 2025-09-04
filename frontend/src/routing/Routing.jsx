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

export const router = createBrowserRouter(
    createRoutesFromElements(
        [<Route
            element={
                <AuthProvider>
                    <Layout />
                </AuthProvider>
            }
        >
            <Route path="/login" element={<Login />} />
            {/* <Route
                path="/dashboard"
                element={
                    <ProtectedRoute admin={true}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            /> */}
            <Route path="/user/:id" element={<EditUser />} />
            <Route path="" element={<Home />} />
            <Route
                path="/auctions"
                element={
                    <ProtectedRoute>
                        <Auctions />
                    </ProtectedRoute>
                }
            />
        </Route>,
        <Route
            element={
                <AuthProvider>
                    <DashboardLayout />
                </AuthProvider>
            }
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