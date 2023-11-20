import '../styles/RideinProgress.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';
import Map_filler from "../images/mapfiller.png";
import { useState, useEffect } from 'react';
import { Driver, Ride } from './models'; /*need a way to identify which ride is happening*/

interface Props {
  driver: Driver;
  ride: Ride;
}

function RideinProgress() 
{
    /* TODO: Add emergency features and a report button */
    
    return (
        <PageTitle title="Ride in Progress">
            <Navbar />
            <div className='RideinProgress'>
                <h1>Ride in Progress</h1>
                <div className="map-container">
                    <img src={Map_filler} alt="filler map" className="map"/>
                </div>

                <div className="ride-info">
                    <div className="progress">
                    <span>{rideProgress}%</span>
                    </div>

                    <button onClick={handleReportDriver}>
                    Report Driver
                    </button>
                </div>
            </div>
        </PageTitle>
    );
}

export default function RideInProgress({driver, ride}: Props) {

    const [rideProgress, setRideProgress] = useState(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        // update rideProgress...
        setRideProgress(updatedProgress); 
      }, 1000);
      return () => clearInterval(interval);
    }, []);
  
    function handleReportDriver() {
      // logic to report driver
    }
}