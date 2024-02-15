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
import RideinProgress from './pages/RideinProgress';
import Rating from './pages/Rating';
import ChooseDriver from './pages/ChooseDriver';
import ChooseRider from './pages/ChooseRider';
import Report from './pages/Report';
import FavoritesList from './pages/FavoritesList';
import BlockedList from './pages/BlockedList';
import EditAccount from './pages/EditAccount';

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
					//console.log(data);
					if (data !== null) {
						const accountData = new Account(data.Email, data.FirstName, data.LastName, data.PhoneNumber, data.AccountType);
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
	//console.log("----")
	// console.log(account.account);

	return (
		<>
			<NavigationBar />
			<Routes>
				<Route path="/" element={<Home />}/>
				<Route path="/Login" element={<Login />}/>
				<Route path="/Payment" element={<Payment/>}/>
				<Route path="/Profile" element={<Profile/>}/>
				<Route path="/Register" element={<Register/>}/>
				<Route path="/RequestRide" element={<RequestRide riderEmail={account?.account?.email}/>}/>
				<Route path="/RideHistory" element={<RideHistory/>}/>
				<Route path="/RideinProgress" element={<RideinProgress/>}/>
				<Route path="/ChooseDriver" element={<ChooseDriver/>}/>
				<Route path="/ChooseRider" element={<ChooseRider/>}/>
				<Route path="/Rating" element={<Rating/>}/>
				<Route path="/Report" element={<Report/>}/>
				<Route path="/FavoritesList" element={<FavoritesList />}/>
				<Route path="/BlockedList" element={<BlockedList />}/>
				<Route path="/EditAccount" element={<EditAccount/>}/>
			</Routes>
		</>
	);
}

export default App;