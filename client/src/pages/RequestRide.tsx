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
            <section id='RequestRide'>
                <h1>Request Ride</h1>
                <MapContainer />
            </section>
        </PageTitle>
    );
}

export default RequestRide;

{/* <div className="requestcontainer">
                    <div className="left-column">
                        <h1>Request Ride</h1>
                        <br/>
                        <br/>
                        <br/>
                        <div className='building-search'>
                            <BuildingSearch />
                        </div>
                        <br/>
                        <button>Submit Request</button>
                    </div>
                    <div className="right-column">
                        <img src={Map_filler} alt="filler map" className="map"/>
                    </div>
                </div> */}