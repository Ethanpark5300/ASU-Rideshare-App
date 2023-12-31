import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Account } from './account/Account';
import { setAccountStore } from './store/features/accountSlice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import "./App.css"

//Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Register from './pages/Register';
import RequestRide from './pages/RequestRide';
import RideHistory from './pages/RideHistory';
import RiderRequest from './pages/RiderRequest';
import Settings from './pages/Settings';
import RideinProgress from './pages/RideinProgress';
import Rating from './pages/Rating';
import ChooseDriver from './pages/ChooseDriver';
import ChooseRider from './pages/ChooseRider';
import ChangePayment from './pages/ChangePayment';
import Report from './pages/Report';

function App() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		readCookie();
	}, []);

	const readCookie = async () => {
		try {
			fetch(`/read-cookie`, {
				method: 'GET',
				headers: { 'Content-type': 'application/json' },
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.Email !== undefined) {
						const accountData = new Account(data.Email);
						dispatch(setAccountStore(accountData));
					} else {
						dispatch(setAccountStore(undefined));
					}
				});
		} catch (error) {
			// Handle the error if necessary
			console.error(error);
		}
	};

	const account = useAppSelector((state) => state.account);

	return (
		<>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/Login" element={<Login />} />
				<Route path="/Payment" element={<Payment />} />
				<Route
					path="/Profile"
					element={
						<Profile
							name={''}
							label={''}
							address={''}
							asuid={''}
							email={account?.account?.email || ''}
							phonenum={''}
							cardnum={0}
							cardname={''}
							expdate={''}
							securitycode={0}
						/>
					}
				/>
				<Route path="/Register" element={<Register />} />
				<Route path="/RequestRide" element={<RequestRide />} />
				<Route path="/RideHistory" element={<RideHistory />} />
				<Route path="/RiderRequest" element={<RiderRequest />} />
				<Route path="/Settings" element={<Settings />} />
				<Route path="/RideinProgress" element={<RideinProgress />} />
				<Route path="/ChooseDriver" element={<ChooseDriver />} />
				<Route path="/ChooseRider" element={<ChooseRider />} />
				<Route path="/ChangePayment" element={<ChangePayment />} />
				<Route path="/Rating" element={<Rating />} />
				<Route path="/Report" element={<Report />} />
			</Routes>
		</>
	);
}

export default App;