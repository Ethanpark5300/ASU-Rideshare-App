import MapContainer from '../components/Google_Maps/MapContainer';
import '../styles/RequestRide.css';
import Navbar from '../components/Navigation_Bar/Navbar';
import BuildingSearch from '../components/Building_Search/BuildingSearch';
import Map_filler from "../images/mapfiller.png";
import PageTitle from '../components/Page_Title/PageTitle';


function RequestRide() {
    return (
        <PageTitle title="Request Ride">
            <Navbar />
            <main id='request-ride'>
                <h1>Request Ride</h1>
                <MapContainer />
            </main>
        </PageTitle>
    );
}

export default RequestRide;