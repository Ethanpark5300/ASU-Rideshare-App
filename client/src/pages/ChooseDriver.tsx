import '../styles/ChooseDriver.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function ChooseDriver() {
    return (
        <PageTitle title="Choose Driver">
            <Navbar />
            <section id="ChooseDriver">
                <h1>Choose a Driver</h1>
            </section>
        </PageTitle>
    );
}

export default ChooseDriver;