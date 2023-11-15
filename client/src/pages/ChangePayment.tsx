import '../styles/ChnagePayment.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function ChangePayment() {
    return (
        <PageTitle title="Change Payment">
            <Navbar />
            <div className='ChangePayment'>
                <h1>Change Payment Information</h1>
            </div>
        </PageTitle>
    );
}

export default ChangePayment;