import '../styles/FavoritesList.css';
import PageTitle from '../components/PageTitle/PageTitle';

function FavoritesList() {
    return (
        <PageTitle title="Favorites List">
            <main id="favorites-list">
                <h1>Favorites List</h1>
            </main>

            {/* Need a default favorites list
            but add as well pending favorite users for driver to accept request from riders
            that have rode with them before.
            In addition add a editing feature to remove favorites. */}
        </PageTitle>
    );
}

export default FavoritesList;