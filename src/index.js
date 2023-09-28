import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import ErrorPage from "./pages/ErrorPage";
import Home from "./pages/Home";
import RequestRide from "./pages/RequestRide";
import TrackRide from "./pages/TrackRide";
import RideHistory from "./pages/RideHistory";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";

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

            ],
        },
    ]
);

createRoot(document.getElementById("root")).render
(
    <RouterProvider router={router} />
);