import '../styles/Waiting.css'
import PageTitle from '../components/PageTitle/PageTitle';
import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import LiveTracking from '../components/GoogleMaps/LiveTracking';
import CancellationTimer from '../components/Timer/Timer';
import { useNavigate } from 'react-router-dom';

function WaitingRider() {
    const account = useAppSelector((state) => state.account);
    const [driverRideInfo, setDriverRideInfo] = useState<any>();
    const [passedCancellation, setPassedCancellation] = useState<boolean>(false);
    const [paymentStatus, setPaymentStatus] = useState<string>()
    const navigate = useNavigate();

    useEffect(() => {
        const delay: number = 125;
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

    const checkPaymentStatus = useCallback(async () => {
        try {
            const response = await fetch(`/get-rider-payment-status?driverid=${account?.account?.email}`);
            const data = await response.json();
            setPaymentStatus(data.rideStatus);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        const interval = setInterval(() => {
            checkPaymentStatus();
            if(paymentStatus !== "PAID") return;
            navigate("/PickupRider");
        }, 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line
    }, [navigate, paymentStatus]);

    const handleTimerEnd = () => {
        setPassedCancellation(true);
    };

    const handleCancelRequest = () => {
        // console.log("Passed cancellation?", passedCancellation)
    }

    return (
        <PageTitle title="Waiting">
            <main id="waiting">
                <div className="waiting-container">
                    {(driverRideInfo) && (
                        <>
                            <h1>Waiting for Rider...</h1>
                            <CancellationTimer initialMinutes={0} initialSeconds={15} onTimerEnd={handleTimerEnd} />
                            <p><b>Rider Name:</b> {driverRideInfo.Rider_FirstName} {driverRideInfo.Rider_LastName}</p>
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
                <LiveTracking />
            </main>
        </PageTitle>
    );
}

export default WaitingRider;