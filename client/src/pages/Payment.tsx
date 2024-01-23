import React from 'react';
import '../styles/Payment.css';
import PageTitle from '../components/Page_Title/PageTitle';
import PayPal from '../components/PayPal/PayPal';

const Payment: React.FC = () => {
    /**
     * Set driver email (Temporary email atm)
     * @TODO Dynamically update each ride
     */
    const driverEmail = 'sb-4swkm28693439@business.example.com';

    /**
     * Ride cost amount (Temporary cost atm)
     * @TODO Dynamically update each ride
     */
    const cost = 50;

    return (
        <PageTitle title="Payment">
            <main id="payment">
                <h1>Payment</h1>
                <br/>
                <h3>Rider Email: {driverEmail}</h3>
                <h3>Ride Cost: ${cost}</h3>
                <PayPal driverEmail={driverEmail} cost={cost} />
            </main>
        </PageTitle>
    );
};

export default Payment;
