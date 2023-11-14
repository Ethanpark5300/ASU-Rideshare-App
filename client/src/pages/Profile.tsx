import React from 'react';
import '../styles/Profile.css';
import GuestNavbar from "../components/Navigation_Bars/Guest_Navbar/Navbar";
import RiderNavbar from "../components/Navigation_Bars/Rider_Navbar/Navbar";
import DriverNavbar from "../components/Navigation_Bars/Driver_Navbar/Navbar";
import { useAppSelector } from '../store/hooks';
import { Account } from '../account/Account';
import PageTitle from '../components/Page_Title/PageTitle';
import profile_filler from "../images/profile.png";

interface ProfileProps {
	name: string;
	label: string;
	address: string;
	asuid: string;
	email: string;
	phonenum: string;
	cardnum: number;
	cardname: string;
	expdate: string;
	securitycode: number;
}

const Profile: React.FC<ProfileProps> = (props) => {
	const account: Account | undefined = useAppSelector((state) => state.account.account);

	/**
	 * @returns Specific navbar based on their login status and user type
	 */
	function navbarConditionDisplay() {
		// Show rider navbar if the user is signed in and a rider
		if (account !== undefined) {
			return <RiderNavbar />;
		} 
		// else if (account === undefined) {
		// 	return <DriverNavbar />;
		// } 
		else {
			// Show guest navbar if the user is not signed in
			return <GuestNavbar />;
		}
	}

	return (
		<PageTitle title="Profile">
			{navbarConditionDisplay()}
			<div className="profile">
				<div className="picture">
					<h1>Account Page</h1>
					<br/>
					<br/>
					<img src={profile_filler} alt="profile picture" className="profileFiller"/>
				</div>
				<div className="profileInfo">
					<h2>Account Info</h2>
					<div className="name">
						<p><strong>Full Name: </strong> {props.name}</p>
					</div>
					<p><strong>ASU ID: </strong> {props.asuid}</p>
					<p><strong>Type: </strong> {props.label}</p>
					<p><strong>Address: </strong> {props.address}</p>
					<p><strong>E-Mail: </strong> {props.email}</p>
					<p><strong>Phone Number: </strong> {props.phonenum}</p>
					<button>Save</button>
				</div>

				<div className="paymentInfo">
					<h2>Payment Info</h2>
					<p><strong>Card Number: </strong> {props.cardnum}</p>
					<p><strong>Name on Card: </strong> {props.cardname}</p>
					<p><strong>Expiration Date: </strong> {props.expdate}</p>
					<p><strong>Security Code: </strong> {props.securitycode}</p>
					<button>Save</button>
				</div>

				<div className="rideHistory">
					<h2>Ride History</h2>
					{/* filler box here for where we would put info */}
					<button>Save</button>
				</div>
			</div>
		</PageTitle>
	);
}

export default Profile;