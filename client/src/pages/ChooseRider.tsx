import "../styles/ChooseRider.css";
import PageTitle from "../components/PageTitle/PageTitle";
import { useAppSelector } from "../store/hooks";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

function ChooseRider() {
    const account = useAppSelector((state) => state.account);
    const [pendingRequestsList, setPendingRequestsList] = useState<any[]>([]);
    const [allRequestsList, setAllRequestsList] = useState<any[]>([]);
    const navigate = useNavigate();

    const refreshRideQueueList = useCallback(async () => {
        try {
            const response = await fetch(`/ride-queue?driveremail=${account?.account?.email}`);
            const data = await response.json();
            setPendingRequestsList(data.pendingRiderRequestsList);
            setAllRequestsList(data.allRequestsList);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    const acceptRequest = async (selectedRider: { Rider_ID: string }) => {
        try {
            navigate("/WaitingRider");
            await fetch(`/accept-ride-request`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    driverid: account?.account?.email,
                    riderid: selectedRider?.Rider_ID
                }),
            });
        } catch (error) {
            console.error("Error accepting ride request:", error);
        }
    };

    useEffect(() => {
        refreshRideQueueList();
    }, [refreshRideQueueList]);

    return (
        <PageTitle title="Choose Rider">
            <main id="choose-rider">
                <header><h1>Choose Rider</h1></header>
                <section className="pending-rider-requests-container">
                    <h2>Pending Rider Requests</h2>
                    {pendingRequestsList.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Rider Name</th>
                                    <th>Pick-up Location</th>
                                    <th>Drop-off Location</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRequestsList.map((ride) => (
                                    <tr key={ride.Ride_ID}>
                                        <td>{ride.First_Name} {ride.Last_Name}</td>
                                        <td>{ride.Pickup_Location}</td>
                                        <td>{ride.Dropoff_Location}</td>
                                        <td><button className="accept-request-btn" onClick={() => acceptRequest(ride)}>Accept Request</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="none-error">No pending ride requests available.</div>
                    )}
                </section>
                <section className="all-rider-requests-container">
                    <h2>All Rider Requests</h2>
                    {allRequestsList.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Rider Name</th>
                                    <th>Pick-up Location</th>
                                    <th>Drop-off Location</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allRequestsList.map((ride) => (
                                    <tr key={ride.Ride_ID}>
                                        <td>{ride.First_Name} {ride.Last_Name}</td>
                                        <td>{ride.Pickup_Location}</td>
                                        <td>{ride.Dropoff_Location}</td>
                                        <td><button className="accept-request-btn" onClick={() => acceptRequest(ride)}>Accept Request</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="none-error">No ride requests available.</div>
                    )}
                </section>
                <section className="btns-container">
                    <button className="refresh-rider-list-btn" onClick={refreshRideQueueList}>Refresh</button>
                </section>
            </main>
        </PageTitle>
    );
}

export default ChooseRider;