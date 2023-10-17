import '../styles/Profile.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import { useAppSelector } from '../store/hooks';
import { Account } from '../account/Account';

function Profile() 
{
	let account: Account | undefined = useAppSelector((state) => state.account.account);
    return (
        <div className='Profile'>
            <Navbar />
			<h1>Profile</h1>
			<p>Logged in as: </p>
			<p>
				{account !== undefined ? account.email : "not logged in"}
			</p>
        </div>
    );
}

export default Profile;
