import '../styles/RequestRide.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import BuildingSearch from '../components/Building_Search/BuildingSearch';

function RequestRide() 
{
    return (
        <div className='RequestRide'>
            <Navbar />
            <h1>Request Ride</h1>
            <br/>
            <div className='building-search'>
                <BuildingSearch />
                <p>hello there pal</p>
            </div>
        </div>
    );
}

export default RequestRide;
