import '../styles/Payment.css';
import GuestNavbar from "../components/Navigation_Bars/Guest_Navbar/Navbar";
import RiderNavbar from "../components/Navigation_Bars/Rider_Navbar/Navbar";
import { useAppSelector } from '../store/hooks';
import { Account } from '../account/Account';

function Payment() 
{
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
        <div className='Payment'>
            {navbarConditionDisplay()}
            <h1>Payment</h1>
        </div>
    );
}

export default Payment;
