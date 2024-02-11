import '../styles/RideHistory.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useAppSelector } from '../store/hooks';
import { useCallback, useEffect, useState } from 'react';

function RideHistory() {
    const account = useAppSelector((state) => state.account);

    const [ridersHistoryList, setRidersHistoryList] = useState<any[]>([]);
    const [driversHistoryList, setDriversHistoryList] = useState<any[]>([]);

    const refreshRideHistoryList = useCallback(async () => {
        try {
            const response = await fetch(`/ride-history?accountType=${account?.account?.accountType}&accountEmail=${account?.account?.email}`);
            const data = await response.json();
            setRidersHistoryList(data.ridersHistoryList);
            setDriversHistoryList(data.driversHistoryList);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.accountType]);

    useEffect(() => {
        refreshRideHistoryList();
    }, [refreshRideHistoryList]);

    return (
        <PageTitle title="Ride History">
            <main id='ride-history'>
                <h1>Ride History</h1>

                {/** @returns Rider history */}
                {account?.account?.accountType === 1 && (
                    <div>
                        <h2>Ride History</h2>
                        {ridersHistoryList.length > 0 ? (
                            <div>
                                {ridersHistoryList.map((ride) => (
                                    <div key={ride.RideHistory_ID}>
                                        <p>{ride.Driver_ID} {ride.Ride_Date} {ride.Pickup} {ride.Dropoff} {ride.Pay}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>No ride history available.</div>
                        )}
                    </div>
                )}

                {/** @returns Driver history */}
                {
                    (account?.account?.accountType === 2) && (
                        <div>
                            <h2>Drive History</h2>
                            {driversHistoryList.length > 0 ? (
                                <div>
                                    {driversHistoryList.map((ride) => (
                                        <div key={ride.RideHistory_ID}>
                                            <p>{ride.Rider_ID} {ride.Ride_Date} {ride.Pickup} {ride.Dropoff} {ride.Earned}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>No drive history available.</div>
                            )}
                        </div>
                    )
                }

                {/** @Returns rider and driver history */}
                {
                    (account?.account?.accountType === 3) && (
                        <div>
                            <h2>Ride History</h2>
                            {ridersHistoryList.length > 0 ? (
                                <div>
                                    {ridersHistoryList.map((ride) => (
                                        <div key={ride.RideHistory_ID}>
                                            <p>{ride.Driver_ID} {ride.Ride_Date} {ride.Pickup} {ride.Dropoff} {ride.Pay}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>No ride history available.</div>
                            )}
                            <br />
                            <h2>Drive History</h2>
                            {driversHistoryList.length > 0 ? (
                                <div>
                                    {driversHistoryList.map((ride) => (
                                        <div key={ride.RideHistory_ID}>
                                            <p>{ride.Rider_ID} {ride.Ride_Date} {ride.Pickup} {ride.Dropoff} {ride.Earned}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>No drive history available.</div>
                            )}
                        </div>
                    )
                }

                <button onClick={refreshRideHistoryList}>Refresh</button>
            </main>
        </PageTitle>
    );
}

export default RideHistory;