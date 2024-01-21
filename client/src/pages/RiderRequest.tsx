import '../styles/RiderRequest.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function RiderRequest() {
    return (
        <PageTitle title="Rider Request">
            <Navbar />
            <main id='rider-request'>  
                <h1>Rider Request</h1>
            </main>
        </PageTitle>
    );
}

export default RiderRequest;