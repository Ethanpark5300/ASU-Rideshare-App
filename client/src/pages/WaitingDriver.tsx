import '../styles/Waiting.css'
import PageTitle from '../components/PageTitle/PageTitle';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import LiveTracking from '../components/GoogleMaps/LiveTracking';
import CancellationTimer from '../components/Timer/Timer';

function WaitingDriver() {
    const account = useAppSelector((state) => state.account);
    const [riderRideInfo, setRiderRideInfo] = useState<any>();
    const [passedCancellation, setPassedCancellation] = useState<boolean>(false);

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
    }

    return (
        <PageTitle title="Waiting">
            <main id="waiting">
                <div className="waiting-container">

                    {/** @returns riders waiting page */}
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
                <LiveTracking />
            </main>
        </PageTitle>
    );
}

export default WaitingDriver;