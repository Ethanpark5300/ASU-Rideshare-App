import '../styles/ChooseRider.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function ChooseRider() {
    return (
        <PageTitle title="Choose Rider">
            <Navbar />
            <section id="ChooseRider">
                <h1>Choose a Rider</h1>
            </section>
        </PageTitle>
    );
}

export default ChooseRider;