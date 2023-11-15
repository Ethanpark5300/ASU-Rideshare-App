import '../styles/TrackRide.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function TrackRide() 
{
    return (
        <PageTitle title="Track Ride">
            <Navbar />
            <div className='TrackRide'>
                <h1>Track Ride</h1>
            </div>
        </PageTitle>
    );
}

export default TrackRide;