import React, { useCallback, useEffect, useState } from 'react';
import '../styles/Profile.css';
import { useAppSelector } from '../store/hooks';
import PageTitle from '../components/PageTitle/PageTitle';
import { Button } from "../components/Buttons/Button";
import { useAppDispatch } from "../store/hooks";
import { setAccountStore } from "../store/features/accountSlice";
// import { Account } from "../account/Account";
import { Link, useNavigate } from 'react-router-dom';

const Profile: React.FC = (props) => {
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

    // const readCookie = async () => {
    //     fetch(`/read-cookie`, {
    //         method: "GET",
    //         headers: { "Content-type": "application/json" },
    //     })
    //         .then((res) => res.json())
    //         .then((data) => {
    //             if (data !== null) {
    //                 console.log(data.Email + " " + data.FirstName + " " + data.LastName + " " + data.PhoneNumber + " " + data.AccountType);
    //                 dispatch(setAccountStore(new Account(data.Email, data.FirstName, data.LastName, data.PhoneNumber, data.AccountType, data.PayPalEmail, data.Status)));
    //             } else {
    //                 dispatch(setAccountStore(undefined));
    //             }
    //         });
    // };

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
                        <Link to="/EditPayment">
                            <button>Change Payment Info</button>
                        </Link>
                    </div>

                    <div className="rideHistory">
                        <Link to="/RideHistory">
                            <button>Ride History</button>
                        </Link>
                    </div>

                    <div className="Favorites">
                        <Link to="/FavoritesList">
                            <button>View Favorites</button>
                        </Link>
                    </div>

                    <div className="Blocked">
                        <Link to="/BlockedList">
                            <button>View Blocked</button>
                        </Link>
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
                            {/* <p><strong>Status: Online</strong></p> */}
                            {/* <p><strong>ASU ID: </strong> {}</p> */}
                            <p><strong>E-Mail: </strong> {account?.account?.email}</p>
                            <p><strong>Phone Number: </strong> {phoneNumber}</p>
                            <p><strong>PayPal Account: </strong> {paypalEmail}</p>
                            {/* <Button label="Check Cookie" onClickFn={readCookie} /> */}

                            <Button label="Nom Cookie(logout)" onClickFn={eatCookie} />
                            <Link to="/EditAccount">
                                <button>Edit Account</button>
                            </Link>
                        </>
                    )}
                    {(userType === 2) && (
                        <>
                            <p><strong>Type: </strong> Driver</p>
                            <p><strong>Status: </strong> {status}</p>
                            {/* <p><strong>ASU ID: </strong> {}</p> */}
                            <p><strong>E-Mail: </strong> {account?.account?.email}</p>
                            <p><strong>Phone Number: </strong> {phoneNumber}</p>
                            <p><strong>PayPal Account: </strong> {paypalEmail}</p>
                            {/* <Button label="Check Cookie" onClickFn={readCookie} /> */}
                            <button onClick={changeStatus}>Change Status</button>

                            <Button label="Nom Cookie(logout)" onClickFn={eatCookie} />
                            <Link to="/EditAccount">
                                <button>Edit Account</button>
                            </Link>
                        </>
                    )}
                </div>
            </main>
        </PageTitle>
    );
}

export default Profile;