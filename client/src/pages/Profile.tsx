import '../styles/Profile.css';
import GuestNavbar from "../components/Navigation_Bars/Guest_Navbar/Navbar";
import RiderNavbar from "../components/Navigation_Bars/Rider_Navbar/Navbar";
import { useAppSelector } from '../store/hooks';
import { Account } from '../account/Account';
import PageTitle from '../components/Page_Title/PageTitle';

function Profile() 
{
	let account: Account | undefined = useAppSelector((state) => state.account.account);

	/** 
	* @returns Specific navbar based on their login status and user type
	*/
	function navbarConditionDisplay() 
	{
		//Show rider navbar if the user is signed in and a rider
		if (account !== undefined) 
		{
			return <RiderNavbar />
		}
		
		//TODO: Show driver navbar if the user is signed in and a driver
		
		//Show guest navbar if the user is not signed in
		else 
		{
			return <GuestNavbar />
		}
	}
    return (
		<PageTitle title="Profile">
			{navbarConditionDisplay()}
			<div className='Profile'>
				<h1>Profile</h1>
				<p>Logged in as: </p>
				<p>
					{account !== undefined ? account.email : "not logged in"}
				</p>
			</div>
		</PageTitle>
    );
}

export default Profile;