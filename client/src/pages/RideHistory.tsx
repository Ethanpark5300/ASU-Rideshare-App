import '../styles/RideHistory.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useAppSelector } from '../store/hooks';
import { useCallback, useEffect, useState } from 'react';
import { AccountTypeFlag } from '../account/Account';

function RideHistory() {
    const account = useAppSelector((state) => state.account);

    const [ridersHistoryList, setRidersHistoryList] = useState<any[]>([]);
    const [driversHistoryList, setDriversHistoryList] = useState<any[]>([]);

    const refreshRideHistoryList = useCallback(async () => {
        try {
            const response = await fetch(`/ride-history?accountEmail=${account?.account?.email}`);
            const data = await response.json();
            setRidersHistoryList(data.ridersHistoryList);
            setDriversHistoryList(data.driversHistoryList);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        refreshRideHistoryList();
    }, [refreshRideHistoryList]);

    return (
        <PageTitle title="Ride History">
            <main id='ride-history'>
                <h1>Ride History</h1>
                <button onClick={refreshRideHistoryList}>Refresh</button>

                {/** @returns Rider history */}
                {(AccountTypeFlag.Rider) && (
                    <div>
                        <h2>Ride History</h2>
                        {ridersHistoryList.length > 0 ? (
                            <div>
                                {ridersHistoryList.map((ride) => (
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
                {
                    (AccountTypeFlag.Driver) && (
                        <div>
                            <h2>Drive History</h2>
                            {driversHistoryList.length > 0 ? (
                                <div>
                                    {driversHistoryList.map((ride) => (
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
                    )
                }

                {/** @returns Rider and Driver history */}
                {
                    (AccountTypeFlag.Rider | AccountTypeFlag.Driver) && (
                        <>
                            <div>
                                <h2>Ride History</h2>
                                {ridersHistoryList.length > 0 ? (
                                    <div>
                                        {ridersHistoryList.map((ride) => (
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
                            <div>
                                <h2>Drive History</h2>
                                {driversHistoryList.length > 0 ? (
                                    <div>
                                        {driversHistoryList.map((ride) => (
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
                        </>
                    )
                }

            </main>
        </PageTitle>
    );
}

export default RideHistory;