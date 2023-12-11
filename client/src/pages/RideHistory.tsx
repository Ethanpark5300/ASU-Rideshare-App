import '../styles/RideHistory.css';
import PageTitle from '../components/Page_Title/PageTitle';
import Navbar from '../components/Navigation_Bar/Navbar';

function RideHistory() 
{
    return (
        <PageTitle title="Ride History">
            <Navbar />
            <section id='RideHistory'>
                <h1>Ride History</h1>
            </section>
        </PageTitle>
    );
}

export default RideHistory;