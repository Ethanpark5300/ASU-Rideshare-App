import '../styles/Profile.css';
import GuestNavbar from "../components/Navigation_Bars/Guest_Navbar/Navbar";
import RiderNavbar from "../components/Navigation_Bars/Rider_Navbar/Navbar";
import { useAppSelector } from '../store/hooks';
import { Account } from '../account/Account';
import PageTitle from '../components/Page_Title/PageTitle';
import defaultProfilePicture from "../images/blank-profile-picture.png"
import { AiOutlineArrowRight } from "react-icons/ai";

function Profile() {
	let account: Account | undefined = useAppSelector((state) => state.account.account);

	/** 
	* @returns Specific navbar based on their login status and user type
	*/
	function navbarConditionDisplay() {
		//Show rider navbar if the user is signed in and a rider
		if (account !== undefined) {
			return <RiderNavbar />
		}

		//TODO: Show driver navbar if the user is signed in and a driver

		//Show guest navbar if the user is not signed in
		else {
			return <GuestNavbar />
		}
	}
	return (
		<PageTitle title="Profile">
			{navbarConditionDisplay()}
			<section className='profile'>
				<div className="profile-content profile-margin-top">
					<div className="profile-row-padding">
						<div className="profile-container profile-card profile-margin-bottom">
							<div className="profile-container">
								<div className="center-align">
									<img className="profile-picture" src={defaultProfilePicture} alt="Avatar" />
									<h3>(Average Star Ratings)</h3>
									<h1>(First Name) (Last Name)</h1>
									<h3>@(Username)</h3>
								</div>
								<hr />
							</div>
							<div className="profile-container">
								<h2 className="edit-arrow"><AiOutlineArrowRight /></h2>
								<h3><b>Full Name</b></h3>
								<p>(First Name) (Last Name)</p>
								<hr />
							</div>
							<div className="profile-container">
								<h2 className="edit-arrow"><AiOutlineArrowRight /></h2>
								<h3><b>Username</b></h3>
								<p>@(Username)</p>
								<hr />
							</div>
							<div className="profile-container">
								<h2 className="edit-arrow"><AiOutlineArrowRight /></h2>
								<h3><b>Email Address</b></h3>
								<p>{account !== undefined ? account.email : "not logged in"}</p>
								<hr />
							</div>
							<div className="profile-container">
								<h2 className="edit-arrow"><AiOutlineArrowRight /></h2>
								<h3><b>Phone Number</b></h3>
								<p>(Phone Number)</p>
								<hr />
							</div>
							<div className="profile-container">
								<h2 className="edit-arrow"><AiOutlineArrowRight /></h2>
								<h3><b>Payment Method</b></h3>
								<p>(Payment Method)</p>
								<hr />
							</div>
							<div className="profile-container">
								<h2 className="edit-arrow"><AiOutlineArrowRight /></h2>
								<h3><b>Ride History</b></h3>
								<p>(Recent Ride)</p>
								<hr />
							</div>
							<br/>
						</div>
					</div>
				</div>
			</section>
		</PageTitle>
	);
}

export default Profile;