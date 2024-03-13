import '../styles/FavoritesList.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useCallback, useState } from 'react';
import { useAppSelector } from '../store/hooks';

function FavoritesList() {
    const account = useAppSelector((state) => state.account);
    const [favoritesList, setFavoritesList] = useState<any[]>([]);
    const [pendingFavoritesList, setPendingFavoritesList] = useState<any[]>([]);

    const getFavoritesList = useCallback(async () => {
        try {
            const response = await fetch(`/get-favorites-list?userid=${account?.account?.email}`);
            const data = await response.json();
            setFavoritesList(data.getFavoritesList);
        } catch (error) {
            console.error("Error getting blocked list:", error);
        }
    }, [account?.account?.email]);
 
    return (
        <PageTitle title="Favorites List">
            <main id="favorites-list">
                <h1>Favorites List</h1>
                <button onClick={getFavoritesList}>Refresh</button>
            </main>
        </PageTitle>
    );
}

export default FavoritesList;