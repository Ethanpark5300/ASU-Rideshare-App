import '../styles/Waiting.css'
import PageTitle from '../components/PageTitle/PageTitle';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import LiveTracking from '../components/GoogleMaps/LiveTracking';
import CancellationTimer from '../components/Timer/Timer';
import { useNavigate } from 'react-router-dom';

function WaitingDriver() {
    const account = useAppSelector((state) => state.account);
    const [riderRideInfo, setRiderRideInfo] = useState<any>();
    const [passedCancellation, setPassedCancellation] = useState<boolean>(false);
    const [beforeCancellationPopup, setBeforeCancellationPopup] = useState<boolean>(false);
    const [passedCancellationPopup, setPassedCancellationPopup] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const delay: number = 125;
        const timerId = setTimeout(() => {
            async function getRideInformation() {
                try {
                    const response = await fetch(`/get-ride-information?userid=${account?.account?.email}`);
                    const data = await response.json();
                    setRiderRideInfo(data.riderRideInfo);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };
            getRideInformation();
        }, delay);
        return () => clearTimeout(timerId);
    }, [account?.account?.email, riderRideInfo]);

    const handleTimerEnd = () => {
        setPassedCancellation(true);
    };

    const handleCancelRequest = () => {
        // console.log("Passed cancellation?", passedCancellation);
        if (!passedCancellation) return setBeforeCancellationPopup(true)
        else setPassedCancellationPopup(true)
    }

    const confirmCancel = async () => {
        try {
            fetch(`/cancel-ride`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userid: account?.account?.email,
                    passedCancellation: passedCancellation
                }),
            })
        } catch (error: any) {
            console.log("Error cancelling ride:", error);
        }
    };

    const handleConfirmCancel = () => {
        confirmCancel();
        navigate("/");
        setBeforeCancellationPopup(false);
        setPassedCancellationPopup(false);
    }
    
    const handleDeclineCancel = () => {
        setBeforeCancellationPopup(false);
        setPassedCancellationPopup(false);
    }

    return (
        <PageTitle title="Waiting">
            <main id="waiting">
                <div className="waiting-container">
                    {(riderRideInfo) && (
                        <>
                            <h1>Waiting for Driver...</h1>
                            <CancellationTimer initialMinutes={0} initialSeconds={15} onTimerEnd={handleTimerEnd} />
                            <p><b>Driver Name:</b> {riderRideInfo.Driver_FirstName} {riderRideInfo.Driver_LastName}</p>
                            <p><b>Pick-up Location:</b> {riderRideInfo.Pickup_Location}</p>
                            <p><b>Drop-off Location:</b> {riderRideInfo.Dropoff_Location}</p>
                            <div className="waiting-btns-container">
                                <button className='btn contact-btn'>Contact Driver</button>
                                <button className='btn emergency-btn'>Emergency Services</button>
                                <button className='btn cancel-btn' onClick={handleCancelRequest}>Cancel Ride</button>
                            </div>
                        </>
                    )}
                </div>

                {/** @returns before cancellation popup warning */}
                {beforeCancellationPopup && (
                    <div className="waiting-before-cancel-popup">
                        <h2>Cancellation Popup Warning</h2>
                        <p>Are you sure you want to cancel the ride?</p>
                        <div className="cancel-btns-container">
                            <button className='btn confirm-cancel-btn' onClick={handleConfirmCancel}>Yes</button>
                            <button className='btn decline-cancel-btn' onClick={handleDeclineCancel}>No</button>
                        </div>
                    </div>
                )}

                {/** @returns after cancellation popup warning */}
                {passedCancellationPopup && (
                    <div className="waiting-after-cancel-popup">
                        <h2>Cancellation Popup Warning</h2>
                        <p>Are you sure you want to cancel the ride?</p>
                        <p>You will recieve an warning on your account if you proceed.</p>
                        <div className="cancel-btns-container">
                            <button className='btn confirm-cancel-btn' onClick={handleConfirmCancel}>Yes</button>
                            <button className='btn decline-cancel-btn' onClick={handleDeclineCancel}>No</button>
                        </div>
                    </div>
                )}
                <LiveTracking />
            </main>
        </PageTitle>
    );
}

export default WaitingDriver;