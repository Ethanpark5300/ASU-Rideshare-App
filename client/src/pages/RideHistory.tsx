import '../styles/RideHistory.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useAppSelector } from '../store/hooks';
import { useEffect, useState } from 'react';

function RideHistory() {
    const account = useAppSelector((state) => state.account);
    const [userType, setUserType] = useState<number>();
    const [ridersRideHistoryList, setRidersRideHistoryList] = useState<any[]>([]);
    const [driversDriveHistoryList, setDriversDriveHistoryList] = useState<any[]>([]);
    const [riderTotalSpendings, setRiderTotalSpendings] = useState<number>();
    const [driverTotalEarnings, setDriverTotalEarnings] = useState<number>();
    const [riderAverageRating, setRiderAverageRating] = useState<number>();
    const [driverAverageRating, setDriverAverageRating] = useState<number>();

    useEffect(() => {
        async function getAccountInformation() {
            try {
                const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
                const data = await response.json();
                if (data.account) setUserType(data.account.Type_User);
            } catch (error) {
                console.error("Error fetching account information:", error);
            }
        }
        async function getRideHistoryList() {
            try {
                const response = await fetch(`/ride-history?userid=${account?.account?.email}`);
                const data = await response.json();
                setRidersRideHistoryList(data.ridersHistoryList);
                setDriversDriveHistoryList(data.driversHistoryList);
            } catch (error) {
                console.error("Error fetching ride history:", error);
            }
        }
        async function getRiderTotalSpendings() {
            if (userType !== 1) return;
            try {
                const response = await fetch(`/get-total-spendings?riderid=${account?.account?.email}`);
                const data = await response.json();
                setRiderTotalSpendings(data.ridersTotalSpendings);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        async function getDriverTotalEarnings() {
            if (userType !== 2) return;
            try {
                const response = await fetch(`/get-total-earnings?driverid=${account?.account?.email}`);
                const data = await response.json();
                setDriverTotalEarnings(data.driversTotalEarnings);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        getAccountInformation();
        getRideHistoryList();
        getRiderTotalSpendings();
        getDriverTotalEarnings();
    }, [account?.account?.email, userType]);

    useEffect(() => {
        const delay = 125;
        const timerId = setTimeout(() => {
            async function getRiderAverageRating() {
                if (userType !== 1) return;
                try {
                    const response = await fetch(`/get-rider-average-rating?riderid=${account?.account?.email}`);
                    const data = await response.json();
                    setRiderAverageRating(data.riderAverageRating);
                } catch (error) {
                    console.error("Error fetching rider average rating:", error);
                }
            }
            async function getDriverAverageRating() {
                if (userType !== 2) return;
                try {
                    const response = await fetch(`/get-driver-average-rating?driverid=${account?.account?.email}`);
                    const data = await response.json();
                    setDriverAverageRating(data.driverAverageRating);
                } catch (error) {
                    console.error("Error fetching driver average rating:", error);
                }
            }
            getRiderAverageRating();
            getDriverAverageRating();
        }, delay);
        return () => clearTimeout(timerId);
    }, [account?.account?.email, userType]);

    /**
     * Rider ride history variables information
     * @param ridersRideHistoryList.First_Name Driver first name
     * @param ridersRideHistoryList.Last_Name Driver last name
     * @param ridersRideHistoryList.Pickup_Location Ride pickup location
     * @param ridersRideHistoryList.Pickup_Time Ride pickup time
     * @param ridersRideHistoryList.Dropoff_Location Ride dropoff location
     * @param ridersRideHistoryList.Dropoff_Time Ride dropoff time
     * @param ridersRideHistoryList.Ride_Cost Ride cost
     * @param ridersRideHistoryList.Given_Rider_Rating Given rider rating
     * @param ridersRideHistoryList.Given_Driver_Rating Given driver rating
     * @param ridersRideHistoryList.Given_Ride_Date Ride date
     * 
     * Driver ride history variables information
     * @param driversDriveHistoryList.First_Name Rider first name
     * @param driversDriveHistoryList.Last_Name Rider last name
     * @param driversDriveHistoryList.Pickup_Location Ride pickup location
     * @param driversDriveHistoryList.Pickup_Time Ride pickup time
     * @param driversDriveHistoryList.Dropoff_Location Ride dropoff location
     * @param driversDriveHistoryList.Dropoff_Time Ride dropoff time
     * @param driversDriveHistoryList.Ride_Cost Ride cost
     * @param driversDriveHistoryList.Given_Rider_Rating Given rider rating
     * @param driversDriveHistoryList.Given_Driver_Rating Given driver rating
     * @param driversDriveHistoryList.Given_Ride_Date Ride date
     */

    // <td>Name = {ride.Driver_FirstName} {ride.Driver_LastName} Pickup Location = {ride.Pickup_Location} Pickup Time = {ride.Pickup_Time} Dropoff Location = {ride.Dropoff_Location} Dropoff Time = {ride.Dropoff_Time} Date = {ride.Ride_Date} Cost = {ride.Cost} Rating = {ride.Given_Rider_Rating}</td>

    return (
        <PageTitle title="Ride History">
            <main id='ride-history'>
                <h1>Ride History</h1>

                {/** Rider history */}
                {(userType === 1) && (
                    <>
                        {ridersRideHistoryList.length > 0 ? (
                            <><table>
                                <thead>
                                    <tr>
                                        <th>Driver</th>
                                        <th>Pickup Location</th>
                                        <th>Pickup Time</th>
                                        <th>Dropoff Location</th>
                                        <th>Dropoff Time</th>
                                        <th>Ride Date</th>
                                        <th>Cost</th>
                                        <th>Rider Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ridersRideHistoryList.map((ride) => (
                                        <tr key={ride.Ride_ID}>
                                            <td>{ride.Driver_FirstName} {ride.Driver_LastName}</td>
                                            <td>{ride.Pickup_Location}</td>
                                            <td>{ride.Pickup_Time}</td>
                                            <td>{ride.Dropoff_Time}</td>
                                            <td>{ride.Dropoff_Location}</td>
                                            <td>{ride.Ride_Date}</td>
                                            <td>{ride.Ride_Cost}</td>
                                            <td>{ride.Given_Rider_Rating}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table><div className="rider-stats">
                                    <p>Total Spending: ${riderTotalSpendings.toFixed(2)}</p>
                                    <p>Average Rating: {riderAverageRating.toFixed(2)}</p>
                                    <p>Total Rides: {ridersRideHistoryList.length}</p>
                                </div></>
                        ) : (
                            <div>No ride history available.</div>
                        )}
                    </>
                )}

                {/** Driver history */}
                {(userType === 2) && (
                    <>
                        {driversDriveHistoryList.length > 0 ? (
                            <div>
                                {driversDriveHistoryList.map((ride) => (
                                    <div key={ride.Ride_ID}>
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
                    </>
                )}
            </main>
        </PageTitle>
    );
}

export default RideHistory;