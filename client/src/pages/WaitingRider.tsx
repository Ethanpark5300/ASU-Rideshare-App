import '../styles/Waiting.css'
import PageTitle from '../components/PageTitle/PageTitle';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import LiveTracking from '../components/GoogleMaps/LiveTracking';
import CancellationTimer from '../components/Timer/Timer';
import { useNavigate } from 'react-router-dom';

function WaitingRider() {
    const account = useAppSelector((state) => state.account);
    const navigate = useNavigate();
    const [driverRideInfo, setDriverRideInfo] = useState<any>();
    const [paymentStatus, setPaymentStatus] = useState<string>();
    const [passedCancellation, setPassedCancellation] = useState<boolean>(false);
    const [beforeCancellationPopup, setBeforeCancellationPopup] = useState<boolean>(false);
    const [passedCancellationPopup, setPassedCancellationPopup] = useState<boolean>(false);
    const [cancellationRiderStatus, setCheckRiderCancellationStatus] = useState<string>();
    const [cancelledRiderPopup, setCancelledRiderPopup] = useState<boolean>(false);

    useEffect(() => {
        const delay = 125;
        const timerId = setTimeout(() => {
            async function getRideInformation() {
                try {
                    const response = await fetch(`/get-ride-information?userid=${account?.account?.email}`);
                    const data = await response.json();
                    setDriverRideInfo(data.driverRideInfo);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };
            getRideInformation();
        }, delay);
        return () => clearTimeout(timerId);
    }, [account?.account?.email]);

    useEffect(() => {
        const interval = setInterval(() => {
            async function checkPaymentStatus() {
                try {
                    const response = await fetch(`/get-rider-payment-status?driverid=${account?.account?.email}`);
                    const data = await response.json();
                    setPaymentStatus(data.rideStatus);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            }
            checkPaymentStatus();
            if (paymentStatus !== "PAID") return;
            navigate("/PickupRider");
        }, 1000);
        return () => clearInterval(interval);
    }, [account?.account?.email, navigate, paymentStatus]);

    const handleTimerEnd = () => {
        setPassedCancellation(true);
    };

    const handleCancelRequest = () => {
        if (!passedCancellation) return setBeforeCancellationPopup(true);
        else setPassedCancellationPopup(true);
    }

    const handleConfirmCancel = () => {
        async function confirmCancel() {
            try {
                fetch(`/cancel-ride`, {
                    method: "POST",
                    headers: { "Content-type": "application/json" },
                    body: JSON.stringify({
                        userid: account?.account?.email,
                        passedCancellation: passedCancellation
                    }),
                });
            } catch (error) {
                console.error("Error cancelling ride:", error);
            }
        }
        confirmCancel();
        navigate("/");
        setBeforeCancellationPopup(false);
        setPassedCancellationPopup(false);
    }

    const handleDeclineCancel = () => {
        setBeforeCancellationPopup(false);
        setPassedCancellationPopup(false);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            async function checkRiderCancellationStatus() {
                try {
                    const response = await fetch(`/check-rider-cancellation-status?driverid=${account?.account?.email}`);
                    const data = await response.json();
                    setCheckRiderCancellationStatus(data.getCancellationStatus);
                } catch (error) {
                    console.error("Error checking driver cancellation status:", error);
                }
            }
            checkRiderCancellationStatus();
            if (cancellationRiderStatus !== "CANCELLED(RIDER)") return;
            setCancelledRiderPopup(true);
        }, 1000);
        return () => clearInterval(interval);
    }, [account?.account?.email, cancellationRiderStatus]);

    return (
        <PageTitle title="Waiting Rider">
            <main id="waiting">
                <div className="waiting-container">
                    {(driverRideInfo) && (
                        <>
                            <h1>Waiting for Rider</h1>
                            <CancellationTimer initialMinutes={3} initialSeconds={0} onTimerEnd={handleTimerEnd} />
                            <p><b>Rider Name:</b> {driverRideInfo.First_Name} {driverRideInfo.Last_Name}</p>
                            <p><b>Pick-up Location:</b> {driverRideInfo.Pickup_Location}</p>
                            <p><b>Drop-off Location:</b> {driverRideInfo.Dropoff_Location}</p>
                            <div className="waiting-btns-container">
                                <button className='btn contact-btn'>Contact Rider</button>
                                <button className='btn emergency-btn'>Emergency Services</button>
                                <button className='btn cancel-btn' onClick={handleCancelRequest}>Cancel Ride</button>
                            </div>
                        </>
                    )}
                </div>

                {/** Before cancellation popup warning */}
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

                {/** After cancellation popup warning */}
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

                {/** Rider cancelled popup */}
                {cancelledRiderPopup && (
                    <div className="rider-cancelled-popup">
                        <p>Sorry, rider cancelled the ride</p>
                        <button onClick={() => navigate("/")} className='btn back-to-home-btn'>Back to Home</button>
                    </div>
                )}

                <LiveTracking />
            </main>
        </PageTitle>
    );
}

export default WaitingRider;