import '../styles/Waiting.css'
import PageTitle from '../components/PageTitle/PageTitle';
import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import LiveTracking from '../components/GoogleMaps/LiveTracking';
import CancellationTimer from '../components/Timer/Timer';

function Waiting() {
    const account = useAppSelector((state) => state.account);
    const [userType, setUserType] = useState<number>();
    const [riderRideInfo, setRiderRideInfo] = useState<any>();
    const [driverRideInfo, setDriverRideInfo] = useState<any>();
    const [waitingRiderStatus, setWaitingRiderStatus] = useState<boolean>(false);
    const [waitingRiderPaymentStatus, setWaitingRiderPaymentStatus] = useState<boolean>(false);
    const [waitingDriverStatus, setWaitingDriverStatus] = useState<boolean>(false);
    const [passedCancellation, setPassedCancellation] = useState<boolean>(false);

    const getAccountInformation = useCallback(async () => {
        try {
            const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
            const data = await response.json();
            if (data.account) setUserType(data.account.Type_User);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        const delay: number = 125;
        const timerId = setTimeout(() => {
            async function getRideInformation() {
                try {
                    const response = await fetch(`/get-ride-information?userid=${account?.account?.email}`);
                    const data = await response.json();
                    setRiderRideInfo(data.riderRideInfo);
                    // setDriverRideInfo(data.driverRideInfo);

                    // console.log(riderRideInfo)
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };
            getRideInformation();
        }, delay);

        return () => clearTimeout(timerId);
    }, [account?.account?.email, riderRideInfo]);

    const getRidePaymentStatus = useCallback(async () => {
        try {
            const response = await fetch(`/get-rider-payment-status?driverid=${account?.account?.email}`);
            const data = await response.json();


        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    const handleTimerEnd = () => {
        setPassedCancellation(true);
    };

    useEffect(() => {
        getAccountInformation();
        getRidePaymentStatus();
    }, [getAccountInformation, getRidePaymentStatus]);

    return (
        <PageTitle title="Waiting">
            <main id="waiting">
                <div className="waiting-container">

                    {/** @returns riders waiting page */}
                    {(userType === 1 && riderRideInfo) && (
                        <>
                            <h1>Waiting</h1>
                            <CancellationTimer initialMinutes={0} initialSeconds={15} onTimerEnd={handleTimerEnd} />
                            <p><b>Driver Name:</b> {riderRideInfo.Driver_FirstName} {riderRideInfo.Driver_LastName}</p>
                            <p><b>Pick-up Location:</b> {riderRideInfo.Pickup_Location}</p>
                            <p><b>Drop-off Location:</b> {riderRideInfo.Dropoff_Location}</p>
                            <p><button>Cancel Ride</button></p>
                        </>
                    )}

                    {/** @returns drivers waiting page */}
                    {(userType === 2) && (
                        <>
                            <button onClick={getRidePaymentStatus}>Check Rider</button>
                        </>
                    )}
                </div>
                <LiveTracking />
            </main>
        </PageTitle >
    );
}

export default Waiting;