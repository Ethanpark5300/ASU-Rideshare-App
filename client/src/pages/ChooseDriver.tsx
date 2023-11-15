import '../styles/ChooseDriver.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function ChooseDriver() {
    return (
        <PageTitle title="Choose Driver">
            <Navbar />
            <div className='ChooseDriver'>
                <h1>Choose a Driver</h1>
            </div>
        </PageTitle>
    );
}

export default ChooseDriver;