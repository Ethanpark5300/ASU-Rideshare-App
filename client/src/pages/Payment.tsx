import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import "../styles/Payment.css"
import PageTitle from '../components/PageTitle/PageTitle';

/** @TODO Replace with driver's sandbox paypal email */
/** Use business accounts for testing */
const driverEmail = 'sb-4swkm28693439@business.example.com';
const amount = 50;

/** @TODO Replace driver first and last name to actual driver's first and last name */
const driverFirstName = "DriverFName"
const driverLastName = "DriverLName"

const paypalOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
};

const Payment: React.FC = () => {
    const [paypalLoaded, setPaypalLoaded] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');

    const createOrder = (data: any, actions: any) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: amount,
                    },
                    driver: {
                        email_address: driverEmail,
                    },
                },
            ],
        });
    };

    const onApprove = (data: any, actions: any) => {
        return actions.order.capture().then(function (details: any) {
            setPaymentStatus('success');
        });
    };

    const onError = (err: any) => {
        console.error('Error occurred:', err);
        setPaymentStatus('error');
    };

    // Set PayPal loaded state to true once component mounts
    React.useEffect(() => {
        setPaypalLoaded(true);
    }, []);

    const renderPopup = () => {
        if (paymentStatus === 'success') {
            return (
                <div className="popup success">
                    <p>Payment successful!</p>
                </div>
            );
        } else if (paymentStatus === 'error') {
            return (
                <div className="popup error">
                    <p>Payment failed. Please try again.</p>
                </div>
            );
        }
        return null;
    };

    return (
        <PageTitle title='Payment'>
            <main id="payment">
                <div className="payment-container">
                    <h1>Payment</h1>
                    <h2>Pay {driverFirstName} {driverLastName}</h2>
                    <h2>Ride Cost: ${amount}</h2>
                    <div className="paypal-btns-container">
                        <PayPalScriptProvider options={paypalOptions}>
                            {paypalLoaded ? (
                                <PayPalButtons
                                    createOrder={createOrder}
                                    onApprove={onApprove}
                                    onError={onError}
                                />
                            ) : (
                                <div>Loading PayPal buttons...</div>
                            )}
                        </PayPalScriptProvider>
                    </div>
                </div>
                {renderPopup()}
            </main>
        </PageTitle>
    );
};

export default Payment;