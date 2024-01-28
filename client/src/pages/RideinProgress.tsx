import { useEffect } from "react";
//import { useAppSelector } from "../../store/hooks";
//import { Account } from "../../account/Account";
import '../styles/RideinProgress.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { Link } from "react-router-dom";
import MapContainer from "../components/GoogleMaps/MapContainer";

/*need a way to identify which ride is happening*/
 //import { Driver, Ride } from './models'; 

 //interface Props {
   //driver: Driver;
    // ride: Ride;
 //}

function RideinProgress() {
    /* TODO: Add emergency features and a report button */
    return (
        <PageTitle title="Ride in Progress">
            <main id="ride-in-progress">
                <MapContainer/>
                <div className="ride-info">
                    <div className="progress">
                        {/* Filler features
                        /*find a way to display current driver here as well*/}

                        <h2>Your driver is navigating to your destination.</h2>
                        <br />
                        <p>
                            Your estimated time left is 15 mins.
                        </p>
                        <br/>
                    </div>
                    <div className="ridebuttons">
                        <Link to="/Report">
                            <button>Report</button>
                        </Link>
                        {/*potentially replace with danger icon*/}
                        <a href="tel: 911">
                            <button>Emergency Help</button>
                        </a>
                        {/*replace with phone icon and driver by number*/}
                        <a href="tel: 000-000-0000">
                            <button>Phone</button>
                        </a>
                    </div>
                </div>
            </main>
        </PageTitle>
    );
}

export default RideinProgress;
