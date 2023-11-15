import '../styles/ChooseRider.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function ChooseRider() {
    return (
        <PageTitle title="Choose Rider">
            <Navbar />
            <div className='ChooseRider'>
                <h1>Choose a Rider</h1>
            </div>
        </PageTitle>
    );
}

export default ChooseRider;