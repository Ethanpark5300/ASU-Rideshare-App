import MapContainer from '../components/Google_Maps/MapContainer';
import '../styles/RequestRide.css';
import Navbar from '../components/Navigation_Bar/Navbar';
import PageTitle from '../components/Page_Title/PageTitle';

function RequestRide() {
    return (
        <PageTitle title="Request Ride">
            <Navbar />
            <main id='request-ride'>
                {/* Request Ride Sidebar */}
                <aside className="request-ride-sidebar">
                    <h1>Request a Ride</h1>
                    <div className="pick-up-location-container">
                        <label htmlFor="pick-up-location">Pick-Up Location:</label>
                        <input type="text" id="pick-up-location" name="pick-up-location" placeholder='Enter Pick-up Location Here...' required/>
                    </div>
                    <div className="drop-off-location-container">
                        <label htmlFor="drop-off-location">Drop-Off Location:</label>
                        <input type="text" id="drop-off-location" name="drop-off-location" placeholder='Enter Drop-off Location Here...' required />
                    </div>
                    <div className="request-buttons">
                        <button className='current-location-button'>Use Current Location</button>
                        <button className='preview-button'>Preview</button>
                        <button className='request-ride-button'>Request Ride</button>
                    </div>
                </aside>

                <MapContainer />

                {/* Request Ride Sidebar */}
                <aside className='request-ride-results-sidebar'>
                    <h1>Results</h1>
                </aside>
            </main>
        </PageTitle>
    );
}

export default RequestRide;