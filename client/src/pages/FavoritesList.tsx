import '../styles/FavoritesList.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { useNavigate } from 'react-router-dom';

function FavoritesList() {
    const account = useAppSelector((state) => state.account);
    const navigate = useNavigate();
    const [userType, setUserType] = useState<number>();
    const [ridersFavoritesList, setRidersFavoritesList] = useState<any[]>([]);
    const [driversPendingFavoritesList, setDriversPendingFavoritesList] = useState<any[]>([]);

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
        async function getFavoritesList() {
            try {
                const response = await fetch(`/get-favorites-list?userid=${account?.account?.email}`);
                const data = await response.json();
                setRidersFavoritesList(data.getRidersFavoritesList);
                setDriversPendingFavoritesList(data.getDriversPendingFavoritesList);
            } catch (error) {
                console.error("Error getting favorites list:", error);
            }
        }
        getAccountInformation();
        getFavoritesList();
    }, [account?.account?.email, ridersFavoritesList, driversPendingFavoritesList]);

    const unfavoriteDriver = async (selectedDriver: { Driver_ID: string; }) => {
        try {
            await fetch(`/unfavorite-driver`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    riderid: account?.account?.email,
                    selectedDriver: selectedDriver?.Driver_ID
                })
            });
        } catch (error) {
            console.error("Error unfavoriting driver:", error);
        }
    };

    const acceptFavoriteRequest = async (selectedRider: { Rider_ID: string }) => {
        try {
            await fetch(`/accept-favorite-request`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    driverid: account?.account?.email,
                    riderid: selectedRider?.Rider_ID
                }),
            });
        } catch (error) {
            console.error("Error accepting favorite request:", error);
        }
    };

    const declineFavoriteRequest = async (selectedRider: { Rider_ID: string }) => {
        try {
            await fetch(`/decline-favorite-request`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    driverid: account?.account?.email,
                    riderid: selectedRider?.Rider_ID
                }),
            });
        } catch (error) {
            console.error("Error declining favorite request:", error);
        }
    };

    return (
        <PageTitle title="Favorites List">
            <main id="favorites-list">

                {/** Rider's favorite and pending favorite list */}
                {(userType === 1) && (
                    <>
                        <header><h1>Favorites List</h1></header>
                        {ridersFavoritesList.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ridersFavoritesList.map((favorite) => (
                                        <tr key={favorite.Favorite_ID}>
                                            <td>{favorite.First_Name} {favorite.Last_Name}</td>
                                            <td>{favorite.Status}</td>
                                            <td>{favorite.Date}</td>
                                            <td><button className='remove-btn' onClick={() => unfavoriteDriver(favorite)}>Remove</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className='none-error'>No favorites list available.</div>
                        )}
                    </>
                )}

                {/** Driver's pending favorite list */}
                {(userType === 2) && (
                    <>
                        <header><h1>Pending Favorites</h1></header>
                        {driversPendingFavoritesList.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {driversPendingFavoritesList.map((favorite) => (
                                        <tr key={favorite.Favorite_ID}>
                                            <td>{favorite.First_Name} {favorite.Last_Name}</td>
                                            <td>{favorite.Date}</td>
                                            <td>
                                                <button className='accept-btn' onClick={() => acceptFavoriteRequest(favorite)}>Accept</button>
                                                <button className='decline-btn' onClick={() => declineFavoriteRequest(favorite)}>Decline</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className='none-error'>No pending rider favorite requests.</div>
                        )}
                    </>
                )}
                <button className='back-to-profile-btn' onClick={() => navigate("/")}>Back to Profile</button>
            </main>
        </PageTitle>
    );
}

export default FavoritesList;