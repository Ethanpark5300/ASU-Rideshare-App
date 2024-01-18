import React from 'react';
import '../styles/Profile.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import { useAppSelector } from '../store/hooks';
import PageTitle from '../components/Page_Title/PageTitle';
import profile_filler from "../images/profile.png";
import { Button } from "../components/Buttons/Button";
import { useAppDispatch } from "../store/hooks";
import { setAccountStore } from "../store/features/accountSlice";
import { Account } from "../account/Account";

interface ProfileProps {
    firstName: string;
    lastName: string;
    label: string;
    address: string;
    asuid: string;
    email: string;
    phonenum: string;
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
                dispatch(setAccountStore(new Account(data.email, data.firstName, data.lastName, data.phoneNumber)));
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
            <Navbar />
            <section id="Profile">
                <div className="picture">
                    <h1>Account Page</h1>
                    <br />
                    <br />
                    <img src={profile_filler} alt="profile picture" className="profileFiller" />
                </div>
                <div className="profileInfo">
                    <h2>Account Info</h2>
                    <p><strong>First Name: </strong> {props.firstName} </p>
                    <p><strong>Last Name: </strong> {props.lastName} </p>
                    <p><strong>ASU ID: </strong> {props.asuid}</p>
                    <p><strong>Type: </strong> {props.label}</p>
                    <p><strong>Address: </strong> </p>
                    <p><strong>E-Mail: </strong> {props.email}</p>
                    <p><strong>Phone Number: </strong> {props.phonenum}</p>
                    <button>Save</button>
                    <Button label="Check Cookie" onClickFn={readCookie} />
                    <Button label="Nom Cookie(logout)" onClickFn={eatCookie} />
                </div>

                <div className="paymentInfo">
                    <h2>Payment Info</h2>
                    <p><strong>Card Number: </strong> {props.paypalEmail}</p>
                    <button>Save</button>
                </div>

                <div className="rideHistory">
                    <h2>Ride History</h2>
                    {/* filler box here for where we would put info */}
                    <button>Save</button>
                </div>
            </section>
        </PageTitle>
    );
}

export default Profile;