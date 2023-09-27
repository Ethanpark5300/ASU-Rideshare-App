import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import Navbar from "./components/Navigation_Bar/Navbar";
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
            <Navbar />
            <Outlet />
        </>
    );
};

const router = createBrowserRouter
(
    [
        {
            element: <AppLayout />,
            //errorElement: <ErrorPage />,
            children: 
            [
                {
                    path: "/",
                    element: <Home />,
                },
                {
                    path: "/",
                    element: <Home />,
                },

            ],
        },
    ]
);

createRoot(document.getElementById("root")).render
(
    <RouterProvider router={router} />
);