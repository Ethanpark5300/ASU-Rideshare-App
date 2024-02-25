import "../styles/ChooseRider.css";
import PageTitle from "../components/PageTitle/PageTitle";
import { useAppSelector } from "../store/hooks";
import { useCallback, useEffect, useState } from "react";

function ChooseRider() {
    const account = useAppSelector((state) => state.account);
    const [pendingRequestsList, setPendingRequestsList] = useState<any[]>([]);
    const [allRequestsList, setAllRequestsList] = useState<any[]>([]);

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

    useEffect(() => {
        refreshRideQueueList();
    }, [refreshRideQueueList]);

    return (
        <PageTitle title="Choose Rider">
            <main id="choose-rider">
                <aside className="chooserider-panel">
                    <h1>Choose a Rider</h1>
                    <section id="pending-rider-requests-container">
                        <h2>Pending Rider Requests</h2>
                        {pendingRequestsList.length > 0 ? (
                            <div>
                                {pendingRequestsList.map((ride) => (
                                    <div key={ride.Ride_ID}>
                                        <p>{ride.Rider_FirstName} {ride.Rider_LastName} {ride.Pickup_Location} {ride.Dropoff_Location} <button>Accept</button></p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>No pending ride requests available.</div>
                        )}
                    </section>
                    <section id="all-rider-requests-container">
                        <h2>All Rider Requests</h2>
                        {allRequestsList.length > 0 ? (
                            <div>
                                {allRequestsList.map((ride) => (
                                    <div key={ride.Ride_ID}>
                                        <p>{ride.Rider_FirstName} {ride.Rider_LastName} {ride.Pickup_Location} {ride.Dropoff_Location} <button>Accept</button></p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>No ride requests available.</div>
                        )}
                    </section>
                    <button onClick={refreshRideQueueList}>Refresh</button>
                </aside>
            </main>
        </PageTitle>
    );
}

export default ChooseRider;