import '../styles/FavoritesList.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { AccountTypeFlag } from '../account/Account';

function FavoritesList() {
    const account = useAppSelector((state) => state.account);
    const [ridersFavoritesList, setRidersFavoritesList] = useState<any[]>([]);
    const [driversPendingFavoritesList, setDriversPendingFavoritesList] = useState<any[]>([]);

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

    useEffect(() => {
        getFavoritesList();
    }, [getFavoritesList]);

    return (
        <PageTitle title="Favorites List">
            <main id="favorites-list">

                {/** @returns rider's favorite and pending favorite list */}
                {(AccountTypeFlag.Rider) && (
                    <>
                        <h1>Favorites List</h1>
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
                                        <tr key={favorite.favorite_id}>
                                            <td>{favorite.First_Name} {favorite.Last_Name}</td>
                                            <td>{favorite.Status}</td>
                                            <td>{favorite.Date}</td>
                                            <td><button onClick={() => unfavoriteUser(favorite)}>Remove</button></td>
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

                <button onClick={getFavoritesList}>Refresh</button>
            </main>
        </PageTitle>
    );
}

export default FavoritesList;