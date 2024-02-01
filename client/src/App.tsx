import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Account } from './account/Account';
import { setAccountStore } from './store/features/accountSlice';
import { useAppDispatch, useAppSelector } from './store/hooks';
import "./App.css"
import NavigationBar from './components/NavigationBar/NavigationBar';

//Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import Register from './pages/Register';
import RequestRide from './pages/RequestRide';
import RideHistory from './pages/RideHistory';
import RiderRequest from './pages/RiderRequest';
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
					console.log(data);
					if (data.Email !== undefined) {
						const accountData = new Account(data.Email, data.FirstName, data.LastName, data.PhoneNumber);
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
	console.log("----")
	console.log(account.account);

	return (
		<>
			<NavigationBar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/Login" element={<Login />} />
				<Route path="/Payment" element={<Payment />} />
				<Route
					path="/Profile"
					element={
						<Profile
							firstName={account?.account?.firstName}
							lastName={account?.account?.lastName}
							label={''}
							address={''}
							asuid={''}
							email={account?.account?.email}
							phoneNumber={account?.account?.phoneNumber}
							paypalEmail={''}
						/>
					}
				/>
				<Route path="/Register" element={<Register />} />
				<Route path="/RequestRide" element={<RequestRide />} />
				<Route path="/RideHistory" element={<RideHistory />} />
				<Route path="/RiderRequest" element={<RiderRequest />} />
				<Route path="/RideinProgress" element={<RideinProgress />} />
				<Route path="/ChooseDriver" element={<ChooseDriver />} />
				<Route path="/ChooseRider" element={<ChooseRider />} />
				<Route path="/ChangePayment" element={<ChangePayment />} />
				<Route path="/Rating" element={<Rating />} />
				<Route
					path="/Report"
					element={
						<Report
							email={account?.account?.email}
						/>
					} 
				/>
			</Routes>
		</>
	);
}

export default App;