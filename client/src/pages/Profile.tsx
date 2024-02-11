import React, { useEffect } from 'react';
import '../styles/Profile.css';
import { useAppSelector } from '../store/hooks';
import PageTitle from '../components/PageTitle/PageTitle';
import profile_filler from "../images/profile.png";
import { Button } from "../components/Buttons/Button";
import { useAppDispatch } from "../store/hooks";
import { setAccountStore } from "../store/features/accountSlice";
import { Account } from "../account/Account";

interface ProfileProps {
    firstName: string;
    lastName: string;
    label: number;
    address: string;
    asuid: string;
    email: string;
    phoneNumber: string;
    paypalEmail: string;
}

const Profile: React.FC<ProfileProps> = (props) => {
    const dispatch = useAppDispatch();

    const readCookie = async () => {
        fetch(`/read-cookie`, {
            method: "GET",
            headers: { "Content-type": "application/json" },
        })

        .then((res) => res.json())
        .then((data) => {
            if (data.Email !== undefined) {
                dispatch(setAccountStore(new Account(data.Email, data.FirstName, data.LastName, data.PhoneNumber, data.AccountType)));
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

    const account = useAppSelector((state) => state.account);

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
                    <p><strong>Name: </strong> {props.firstName} {props.lastName} </p>

                    {/** @Returns user type */}
                    {
                        (account?.account?.accountType === 1) && (
                            <p><strong>Type: </strong> Rider</p>
                        )
                    }
                    {
                        (account?.account?.accountType === 2) && (
                            <p><strong>Type: </strong> Driver</p>
                        )
                    }
                    <p><strong>Address: </strong> {props.address} </p>
                    <p><strong>ASU ID: </strong> {props.asuid}</p>
                    <p><strong>E-Mail: </strong> {props.email}</p>
                    <p><strong>Phone Number: </strong> {props.phoneNumber}</p>
                    <button>Save</button>
                    <Button label="Check Cookie" onClickFn={readCookie} />
                    <Button label="Nom Cookie(logout)" onClickFn={eatCookie} />
                </div>

                <div className="paymentInfo">
                    <h2>Payment Info</h2>
                    <p><strong>PayPal Email: </strong> {props.paypalEmail}</p>
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