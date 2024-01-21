import '../styles/ChangePayment.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function ChangePayment() {
    return (
        <PageTitle title="Change Payment">
            <Navbar />
            <main id="change-payment">
                <h1>Change Payment Information</h1>
            </main>
        </PageTitle>
    );
}

export default ChangePayment;