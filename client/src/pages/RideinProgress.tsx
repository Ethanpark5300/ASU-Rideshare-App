import { useEffect } from "react";
//import { useAppSelector } from "../../store/hooks";
//import { Account } from "../../account/Account";
import '../styles/RideinProgress.css';
import PageTitle from '../components/Page_Title/PageTitle';
import Map_filler from "../images/mapfiller.png";
import { Link } from "react-router-dom";
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';

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
                
            </main>
            {<section id='RideinProgress'>
                <h1>Ride in Progress</h1>
                <div className="map-container">
                    <img src={Map_filler} alt="filler map" className="map" />
                </div>

                <div className="ride-info">
                    <div className="progress">
                        // Filler features
                        /*find a way to display current driver here as well*/
                        <p>
                            Your driver is navigating to your destination.
                            Your estimated time left is 15 mins.
                        </p>
                        <br />
                    </div>
                    <Link to="/Report">
                        <button>Report</button>
                    </Link>
                    //potentially replace with danger icon
                    <a href="tel: 911">
                        <button>Emergency Help</button>
                    </a>
                    //replace with phone icon and driver by number
                    <a href="tel: 000-000-0000">
                        <button>Phone</button>
                    </a>
                </div>
            </section>}
        </PageTitle>
    );
}

export default RideinProgress;
