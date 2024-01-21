import '../styles/RideHistory.css';
import PageTitle from '../components/Page_Title/PageTitle';
import Navbar from '../components/Navigation_Bar/Navbar';

function RideHistory() 
{
    return (
        <PageTitle title="Ride History">
            <Navbar />
            <main id='ride-history'>
                <h1>Ride History</h1>
            </main>
        </PageTitle>
    );
}

export default RideHistory;