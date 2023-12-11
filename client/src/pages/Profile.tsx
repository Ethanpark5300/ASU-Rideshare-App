import React from 'react';
import '../styles/Profile.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import { useAppSelector } from '../store/hooks';
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

    return (
        <PageTitle title="Profile">
            <Navbar />
            <section id="Profile">
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
                    <p><strong>Address: </strong> </p>
                    <p><strong>E-Mail: </strong> {props.email}</p>
                    <p><strong>Phone Number: </strong> {props.phonenum}</p>
                    <button>Save</button>
                </div>
                
                {/* TODO: Add signout button */}

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
            </section>
        </PageTitle>
    );
}

export default Profile;