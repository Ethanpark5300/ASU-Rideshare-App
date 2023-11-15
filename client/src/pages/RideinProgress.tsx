import '../styles/RideinProgress.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function RideinProgress() 
{
    return (
        <PageTitle title="Ride in Progress">
            <Navbar />
            <div className='RideinProgress'>
                <h1>Ride in Progress</h1>
            </div>
        </PageTitle>
    );
}

export default RideinProgress;