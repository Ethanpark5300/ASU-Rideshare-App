import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Account } from './account/Account';
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
import { setAccountStore } from './store/features/accountSlice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import Rating from './pages/Rating';

function App() {
	const dispatch = useAppDispatch();
	useEffect(() => {
		readCookie();
	}, []);
	const readCookie = async () => {
		try {
			fetch(`/read-cookie`, {
				method: "GET",
				headers: { "Content-type": "application/json" },
			})
			.then((res) => res.json())
				.then((data) => {
					if (data.Email !== undefined) {
						dispatch(setAccountStore(new Account(data.Email)));
					} else {
						dispatch(setAccountStore(undefined));
					}
				});
		} catch {

		}
	};
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
				<Route path="/Rating" element={<Rating name={''}/>} />
			</Routes>
		</>
	);
}

export default App;