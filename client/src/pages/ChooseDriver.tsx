import '../styles/ChooseDriver.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function ChooseDriver() {
    return (
        <PageTitle title="Choose Driver">
            <Navbar />
            <main id="choose-driver">
                <h1>Choose a Driver</h1>
            </main>
        </PageTitle>
    );
}

export default ChooseDriver;