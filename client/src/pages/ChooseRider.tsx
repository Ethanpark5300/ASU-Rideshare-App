import '../styles/ChooseRider.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function ChooseRider() {
    return (
        <PageTitle title="Choose Rider">
            <Navbar />
            <main id="choose-rider">
                <h1>Choose a Rider</h1>
            </main>
        </PageTitle>
    );
}

export default ChooseRider;