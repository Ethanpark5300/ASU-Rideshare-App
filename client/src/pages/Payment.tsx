import '../styles/Payment.css';
import Navbar from "../components/Navigation_Bar/Navbar";
import PageTitle from '../components/Page_Title/PageTitle';

function Payment() 
{
    return (
        <PageTitle title="Payment">
            <Navbar />
            <div className='Payment'>
                <h1>Payment</h1>
            </div>
        </PageTitle>
    );
}

export default Payment;