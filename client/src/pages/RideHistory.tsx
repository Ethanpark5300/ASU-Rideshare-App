import '../styles/RideHistory.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useAppSelector } from '../store/hooks';
import { useCallback, useEffect, useState } from 'react';

function RideHistory() {
    const account = useAppSelector((state) => state.account);
    const [userType, setUserType] = useState<number>();
    const [ridersRideHistoryList, setRidersRideHistoryList] = useState<any[]>([]);
    const [driversDriveHistoryList, setDriversDriveHistoryList] = useState<any[]>([]);

    const getAccountInformation = useCallback(async () => {
        try {
            const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
            const data = await response.json();
            if (data.account) setUserType(data.account.Type_User);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    const getRideHistoryList = useCallback(async () => {
        try {
            const response = await fetch(`/ride-history?userid=${account?.account?.email}`);
            const data = await response.json();
            setRidersRideHistoryList(data.ridersHistoryList);
            setDriversDriveHistoryList(data.driversHistoryList);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        getRideHistoryList();
        getAccountInformation();
    }, [getRideHistoryList, getAccountInformation]);

    return (
        <PageTitle title="Ride History">
            <main id='ride-history'>
                <h1>Ride History</h1>

                {/** @returns Rider history */}
                {(userType === 1) && (
                    <div>
                        <h2>Ride History</h2>
                        {ridersRideHistoryList.length > 0 ? (
                            <div>
                                {ridersRideHistoryList.map((ride) => (
                                    <div key={ride.RideHistory_ID}>
                                        <table>
                                            <tr>
                                                <td>Name = {ride.Driver_FirstName} {ride.Driver_LastName} Time = {ride.Pickup_Time} Location = {ride.Dropoff_Location} Date = {ride.Ride_Date} Cost = {ride.Cost} Rating = {ride.Given_Rider_Rating}</td>
                                            </tr>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>No ride history available.</div>
                        )}
                    </div>
                )}

                {/** @returns Driver history */}
                {(userType === 2) && (
                    <div>
                        <h2>Drive History</h2>
                        {driversDriveHistoryList.length > 0 ? (
                            <div>
                                {driversDriveHistoryList.map((ride) => (
                                    <div key={ride.RideHistory_ID}>
                                        <table>
                                            <tr>
                                                <td>Name = {ride.Rider_FirstName} {ride.Rider_LastName} Date = {ride.Ride_Date} Time = {ride.Pickup_Time} Location = {ride.Dropoff_Location} Payout = {ride.Earned} Rating = {ride.Given_Driver_Rating}</td>
                                            </tr>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>No drive history available.</div>
                        )}
                    </div>
                )}
                <button onClick={getRideHistoryList}>Refresh</button>
            </main>
        </PageTitle>
    );
}

export default RideHistory;