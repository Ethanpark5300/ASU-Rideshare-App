import '../styles/RiderRequest.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function RiderRequest() {
    return (
        <PageTitle title="Rider Request">
            <Navbar />
            <section id='RiderRequest'>  
                <h1>Rider Request</h1>
            </section>
        </PageTitle>
    );
}

export default RiderRequest;