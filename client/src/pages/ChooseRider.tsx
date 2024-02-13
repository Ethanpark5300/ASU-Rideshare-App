import '../styles/ChooseRider.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useAppSelector } from '../store/hooks';
import { useCallback, useState } from 'react';

function ChooseRider() {
    const account = useAppSelector((state) => state.account);

    const [pendingRequestsList, setPendingRequestsList] = useState<any[]>([]);
    const [allRequestsList, setAllRequestsList] = useState<any[]>([]);

    const refreshRideQueueList = useCallback(async () => {
        console.log("dasda")
        try {
            const response = await fetch(`/ride-queue?accountEmail=${account?.account?.email}`);
            const data = await response.json();
            setAllRequestsList(data.allRequestsList)
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    return (
        <PageTitle title="Choose Rider">
            <main id="choose-rider">
                <h1>Choose a Rider</h1>
                <h2>Pending Requests</h2>
                <br />
                <h2>All Requests</h2>
                {allRequestsList.length > 0 ? (
                    <div>
                        {allRequestsList.map((ride) => (
                            <div key={ride.RideQueue_ID}>
                                <p>{ride.Rider_ID} {ride.Pickup} {ride.Dropoff} <button>Accept</button></p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>No ride requests available.</div>
                )}
                <button onClick={refreshRideQueueList}>Refresh</button>
            </main>
        </PageTitle>
    );
}

export default ChooseRider;