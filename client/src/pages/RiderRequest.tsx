import '../styles/RiderRequest.css';
import Navbar from "../components/Navigation_Bars/Rider_Navbar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function RiderRequest() {
    return (
        <PageTitle title="Rider Request">
            <div className='RiderRequest'>
                <Navbar />
                <h1>Rider Request</h1>
            </div>
        </PageTitle>
    );
}

export default RiderRequest;