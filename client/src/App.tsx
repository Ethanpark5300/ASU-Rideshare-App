import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register"
import RequestRide from "./pages/RequestRide";
import TrackRide from "./pages/TrackRide";
import RideHistory from "./pages/RideHistory";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import ErrorPage from "./pages/ErrorPage";

const AppLayout = () => 
{
    return (
        <> 
            <Outlet />
        </>
    );
};

const router = createBrowserRouter
(
    [
        {
            element: <AppLayout />,
            errorElement: <ErrorPage />,
            children: 
            [
                {
                    path: "/",
                    element: <Home />,
                },
                {
                    path: "Login",
                    element: <Login />,
                },
                {
                    path: "Register",
                    element: <Register />,
                },
                {
                    path: "RequestRide",
                    element: <RequestRide />,
                },
                {
                    path: "TrackRide",
                    element: <TrackRide />,
                },
                {
                    path: "RideHistory",
                    element: <RideHistory />,
                },
                {
                    path: "Payment",
                    element: <Payment />,
                },
                {
                    path: "Profile",
                    element: <Profile />,
                },
                {
                    path: "ASU-Rideshare-App",
                    element: <Home />,
                },
            ],
        },
    ]
);

export default router;