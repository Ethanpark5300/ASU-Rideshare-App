import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Register from './pages/Register';
import RequestRide from './pages/RequestRide';
import RideHistory from './pages/RideHistory';
import RiderRequest from './pages/RiderRequest';
import Settings from './pages/Settings';
import TrackRide from './pages/TrackRide';

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/Payment" element={<Payment />} />
                <Route path="/Profile" element={<Profile name={''} label={''} address={''} asuid={''} email={''} phonenum={''} cardnum={0} cardname={''} expdate={''} securitycode={0} />} />
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