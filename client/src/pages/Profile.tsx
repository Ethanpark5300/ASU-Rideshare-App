import { useCallback, useEffect, useState } from 'react';
import '../styles/Profile.css';
import { useAppSelector } from '../store/hooks';
import PageTitle from '../components/PageTitle/PageTitle';
import { Button } from "../components/Buttons/Button";
import { useAppDispatch } from "../store/hooks";
import { setAccountStore } from "../store/features/accountSlice";
import { useNavigate } from 'react-router-dom';

function Profile() {
    const dispatch = useAppDispatch();
    const account = useAppSelector((state) => state.account);
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [userType, setUserType] = useState<number>(1);
    const [paypalEmail, setPaypalEmail] = useState<string>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    const getAccountInformation = useCallback(async () => {
        try {
            const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
            const data = await response.json();

            if (data.account) {
                setFirstName(data.account.First_Name);
                setLastName(data.account.Last_Name);
                setUserType(data.account.Type_User);
                setPaypalEmail(data.account.Pay_Pal);
                setPhoneNumber(data.account.Phone_Number);
                setStatus(data.account.Status_User);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        getAccountInformation();
    }, [getAccountInformation]);

    const eatCookie = async () => {
        await fetch(`/clear-cookie?userEmail=${account?.account?.email}`);
        dispatch(setAccountStore(undefined));
        navigate("/Login");
    };

    const changeStatus = async () => {
        try {
            fetch(`/change-status`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userEmail: account?.account?.email,
                    currentStatus: status,
                }),
            })
            getAccountInformation();
        } catch (e: any) {
            console.log(e);
        }
    };

    return (
        <PageTitle title="Profile">
            <main id="profile">
                <div className="sidebar">
                    <div className="paymentInfo">
                        <button onClick={() => navigate("/EditPayment")}>Change Payment Info</button>
                    </div>

                    <div className="rideHistory">
                        <button onClick={() => navigate("/RideHistory")}>Ride History</button>
                    </div>

                    <div className="Favorites">
                        <button onClick={() => navigate("/FavoritesList")}>View Favorites</button>
                    </div>

                    <div className="Blocked">
                        <button onClick={() => navigate("/BlockedList")}>View Blocked</button>
                    </div>

                    <div className="changePassword">
                        <button onClick={() => navigate("/ChangePassword")}>Change Password</button>
                    </div>
                </div>

                <div className="profileInfo">
                    <header>
                        <h2>Account Info</h2>
                    </header>
                    <br />
                    <p><strong>Name: </strong> {firstName} {lastName} </p>

                    {(userType === 1) && (
                        <>
                            <p><strong>Type: </strong> Rider</p>
                            <p><strong>E-Mail: </strong> {account?.account?.email}</p>
                            <p><strong>Phone Number: </strong> {phoneNumber}</p>
                            <p><strong>PayPal Account: </strong> {paypalEmail}</p>

                            <Button label="Logout" onClickFn={eatCookie} />
                            <button onClick={() => navigate("/EditAccount")}>Edit Account</button>
                        </>
                    )}
                    {(userType === 2) && (
                        <>
                            <p><strong>Type: </strong> Driver</p>
                            <p><strong>Status: </strong> {status}</p>
                            <p><strong>E-Mail: </strong> {account?.account?.email}</p>
                            <p><strong>Phone Number: </strong> {phoneNumber}</p>
                            <p><strong>PayPal Account: </strong> {paypalEmail}</p>
                            <button onClick={changeStatus}>Change Status</button>

                            <Button label="Logout" onClickFn={eatCookie} />
                            <button onClick={() => navigate("/EditAccount")}>Edit Account</button>
                        </>
                    )}
                </div>
            </main>
        </PageTitle>
    );
}

export default Profile;