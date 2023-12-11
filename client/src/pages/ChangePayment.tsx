import '../styles/ChangePayment.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function ChangePayment() {
    return (
        <PageTitle title="Change Payment">
            <Navbar />
            <section id="ChangePayment">
                <h1>Change Payment Information</h1>
            </section>
        </PageTitle>
    );
}

export default ChangePayment;