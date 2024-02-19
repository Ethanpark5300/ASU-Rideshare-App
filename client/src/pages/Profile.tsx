import React, { useCallback, useEffect, useState } from 'react';
import '../styles/Profile.css';
import { useAppSelector } from '../store/hooks';
import PageTitle from '../components/PageTitle/PageTitle';
import profile_filler from "../images/profile.png";
import { Button } from "../components/Buttons/Button";
import { useAppDispatch } from "../store/hooks";
import { setAccountStore } from "../store/features/accountSlice";
import { Account } from "../account/Account";
import { Link } from 'react-router-dom';

const Profile: React.FC = (props) => {
    const dispatch = useAppDispatch();
    const account = useAppSelector((state) => state.account);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userType, setUserType] = useState(1);
    const [paypalEmail, setPaypalEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const getAccountInformation = useCallback(async () => {
        try {
            const response = await fetch(`/edit-account?accountEmail=${account?.account?.email}`);
            const data = await response.json();

            if (data.account) {
                setFirstName(data.account.First_Name);
                setLastName(data.account.Last_Name);
                setUserType(data.account.Type_User);
                setPaypalEmail(data.account.Pay_Pal);
                setPhoneNumber(data.account.Phone_Number);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        getAccountInformation();
    }, [getAccountInformation]);

    const readCookie = async () => {
        fetch(`/read-cookie`, {
            method: "GET",
            headers: { "Content-type": "application/json" },
        })

			.then((res) => res.json())
			.then((data) => {
			if (data !== null) {
				
				console.log(data.Email + " " + data.FirstName + " " + data.LastName + " " + data.PhoneNumber + " " + data.AccountType);
                dispatch(setAccountStore(new Account(data.Email, data.FirstName, data.LastName, data.PhoneNumber, data.AccountType, data.PayPalEmail)));
            } else {
                dispatch(setAccountStore(undefined));
            }
        });
    };

    const eatCookie = async () => {
        try {
            fetch(`/clear-cookie`, {
                method: "GET",
                headers: { "Content-type": "application/json" },
            });
            dispatch(setAccountStore(undefined));
        } catch { }
    };

    return (
        <PageTitle title="Profile">
            <main id="profile">
                <div className="picture">
                    <h1>Account Page</h1>
                    <br />
                    <br />
                    <img src={profile_filler} alt="profile picture" className="profileFiller" />
                </div>
                <div className="profileInfo">
                    <h2>Account Info</h2>
                    <p><strong>Name: </strong> {firstName} {lastName} </p>

                    {
                        (userType === 1) && (
                            <p><strong>Type: </strong> Rider</p>
                        )
                    }
                    {
                        (userType === 2) && (
                            <p><strong>Type: </strong> Driver</p>
                        )
                    }
                    {
                        (userType === 3) && (
                            <p><strong>Type: </strong> Both</p>
                        )
                    }
                    {/* <p><strong>Address: </strong> {} </p>
                    <p><strong>ASU ID: </strong> {}</p> */}
                    <p><strong>E-Mail: </strong> {account?.account?.email}</p>
                    <p><strong>Phone Number: </strong> {phoneNumber}</p>
                    <p><strong>PayPal Account: </strong> {paypalEmail}</p>
                    <button>Save</button>
                    <Button label="Check Cookie" onClickFn={readCookie} />
                    <Button label="Nom Cookie(logout)" onClickFn={eatCookie} />
                    <Link to="/EditAccount">
                        <button>Edit Account</button>
                    </Link>
                </div>

                <div className="paymentInfo">
                    <h2>Payment Info</h2>
                    <p><strong>PayPal Email: </strong> {}</p>
                    <button>Save</button>
                </div>

                <div className="rideHistory">
                    <h2>Ride History</h2>
                    {/* filler box here for where we would put info */}
                    <button>Save</button>
                </div>
            </main>
        </PageTitle>
    );
}

export default Profile;