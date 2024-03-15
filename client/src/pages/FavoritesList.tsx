import '../styles/FavoritesList.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { Link } from 'react-router-dom';

function FavoritesList() {
    const account = useAppSelector((state) => state.account);
    const [userType, setUserType] = useState();
    const [ridersFavoritesList, setRidersFavoritesList] = useState<any[]>([]);
    const [driversPendingFavoritesList, setDriversPendingFavoritesList] = useState<any[]>([]);

    const getAccountInformation = useCallback(async () => {
        try {
            const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
            const data = await response.json();

            if (data.account) {
                setUserType(data.account.Type_User);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    const getFavoritesList = useCallback(async () => {
        try {
            const response = await fetch(`/get-favorites-list?userid=${account?.account?.email}`);
            const data = await response.json();
            setRidersFavoritesList(data.getRidersFavoritesList);
            setDriversPendingFavoritesList(data.getDriversPendingFavoritesList);
        } catch (error) {
            console.error("Error getting blocked list:", error);
        }
    }, [account?.account?.email]);

    const unfavoriteUser = async (selectedUser: { First_Name: string; Last_Name: string; }) => {
        try {
            await fetch(`/unfavorite-driver`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userid: account?.account?.email,
                    selectedFirstName: selectedUser?.First_Name,
                    selectedLastName: selectedUser?.Last_Name
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setRidersFavoritesList(data.getRidersFavoritesList);
                    getFavoritesList();
                });
        } catch (error) {
            console.error("Error unfavoriting request:", error);
        }
    };

    const acceptFavoriteRequest = async (selectedUser: { First_Name: string; Last_Name: string; }) => {
        try {
            await fetch(`/accept-favorite-request`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userid: account?.account?.email,
                    selectedFirstName: selectedUser?.First_Name,
                    selectedLastName: selectedUser?.Last_Name
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setRidersFavoritesList(data.getDriversPendingFavoritesList);
                    getFavoritesList();
                });
        } catch (error) {
            console.error("Error unfavoriting request:", error);
        }
    };

    const declineFavoriteRequest = async (selectedUser: { First_Name: string; Last_Name: string; }) => {
        try {
            await fetch(`/decline-favorite-request`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userid: account?.account?.email,
                    selectedFirstName: selectedUser?.First_Name,
                    selectedLastName: selectedUser?.Last_Name
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setRidersFavoritesList(data.getDriversPendingFavoritesList);
                    getFavoritesList();
                });
        } catch (error) {
            console.error("Error unfavoriting request:", error);
        }
    };

    useEffect(() => {
        getFavoritesList();
        getAccountInformation();
    }, [getFavoritesList, getAccountInformation]);

    return (
        <PageTitle title="Favorites List">
            <main id="favorites-list">

                {/** @returns rider's favorite and pending favorite list */}
                {(userType === 1 || userType === 3) && (
                    <>
                        <header>
                            <h1>Favorites</h1>
                        </header>
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
                                            <td><button className='remove-btn' onClick={() => unfavoriteUser(favorite)}>Remove</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div>No favorites list available.</div>
                        )}
                    </>
                )}

                {/** @returns driver's pending favorite list */}
                {(userType === 2) && (
                    <>
                        <header>
                            <h1>Pending Favorites</h1>
                        </header>
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
                            <div>No pending rider favorites.</div>
                        )}
                    </>
                )}
                <div className="favorites-btns-container">
                    <button onClick={getFavoritesList} className='refresh-btn'>Refresh</button>
                    <Link to="/Profile">
                        <button className='back-to-profile-btn'>Back to Profile</button>
                    </Link>
                </div>
            </main>
        </PageTitle>
    );
}

export default FavoritesList;