import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Payment from './pages/Payment.tsx';
import Profile from './pages/Profile.tsx';
import Register from './pages/Register.tsx';
import RequestRide from './pages/RequestRide.tsx';
import RideHistory from './pages/RideHistory.tsx';
import RiderRequest from './pages/RiderRequest.tsx';
import Settings from './pages/Settings.tsx';
import TrackRide from './pages/TrackRide.tsx';

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Payment" element={<Payment />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/Register" element={<Register />} />
                <Route path="/RequestRide" element={<RequestRide />} />
                <Route path="/RideHistory" element={<RideHistory />} />
                <Route path="/RiderRequest" element={<RiderRequest />} />
                <Route path="/Settings" element={<Settings />} />
                <Route path="/TrackRide" element={<TrackRide />} />
            </Routes>
        </>
    );
}

export default App;