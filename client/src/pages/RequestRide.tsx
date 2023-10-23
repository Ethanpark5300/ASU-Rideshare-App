import '../styles/RequestRide.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import BuildingSearch from '../components/Building_Search/BuildingSearch';

function RequestRide() 
{
    return (
        <div className='RequestRide'>
            <Navbar />
            <div className="left-column">
                <h1>Request Ride</h1>
                <br/>
                <div className='building-search'>
                    <BuildingSearch />
                    
                </div>
                <button>Submit Request</button>
            </div>
            <div className="right-collumn">
                <img src="mapfiller.png" alt="filler map" />
            </div>
        </div>
    );
}

export default RequestRide;
