import React, { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import "../styles/Payment.css"
import PageTitle from '../components/PageTitle/PageTitle';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

/** @TODO Replace with driver's sandbox paypal email */
/** Use sandbox business accounts for testing */
const driverPayPalEmail = 'sb-4swkm28693439@business.example.com';
const amount = 50;

/** @TODO Replace with actual driver's name */
const driverName = "FirstName LastName";

const paypalOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
};

const Payment: React.FC = (props) => {
    const account = useAppSelector((state) => state.account);
    const [paypalLoaded, setPaypalLoaded] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');
    const [showErrorPopup, setShowErrorPopup] = useState(false); // State to track whether error popup is open

    const createOrder = (data: any, actions: any) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: amount,
                    },
                    driver: {
                        email_address: driverPayPalEmail,
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
        // console.error('Error occurred:', err);
        setPaymentStatus('error');
        setShowErrorPopup(true); // Show error popup when payment fails
    };

    // Set PayPal loaded state to true once component mounts
    useEffect(() => {
        setPaypalLoaded(true);
    }, []);

    const closeErrorPopup = () => {
        setShowErrorPopup(false); // Close error popup when try again button is clicked
    };

    const renderPopup = () => {
        if (paymentStatus === 'success') {
            try {
                fetch(`/send-payment`, {
                    method: "POST",
                    headers: { "Content-type": "application/json" },
                    body: JSON.stringify({
                        Rider_ID: account?.account?.email,
                        driverPayPalEmail: driverPayPalEmail,
                        rideCost: amount,
                    }),
                })
            }
            catch (e: any) {
                console.log(e);
            }

            return (
                <div className="payment-success-popup">
                    <p>Payment successful!</p>
                    <Link to="/">
                        <button>Back to Home</button>
                    </Link>
                </div>
            );
        } else if (paymentStatus === 'error' && showErrorPopup) {
            return (
                <div className="payment-error-popup">
                    <p>Payment failed. Please try again.</p>
                    <button onClick={closeErrorPopup}>Try Again</button>
                </div>
            );
        }
        return null;
    };

    //https://developer.paypal.com/docs/multiparty/checkout/standard/customize/buttons-style-guide/
    const buttonStyles = {
        color: 'gold' as const,
        shape: 'pill' as const,
        label: 'pay' as const,
    };

    return (
        <PageTitle title='Payment'>
            <main id="payment">
                <div className="payment-wrapper">
                    <div className="payment-container">
                        <h1>Payment</h1>
                        <h2>Pay {driverName}</h2>
                        <h2>Ride Cost: ${amount}</h2>
                        <div className="paypal-btns-container">
                            <PayPalScriptProvider options={paypalOptions}>
                                {paypalLoaded ? (
                                    <PayPalButtons
                                        createOrder={createOrder}
                                        onApprove={onApprove}
                                        onError={onError}
                                        style={buttonStyles}
                                    />
                                ) : (
                                    <div>Loading PayPal buttons...</div>
                                )}
                            </PayPalScriptProvider>
                        </div>
                    </div>
                </div>
                {renderPopup()}
            </main>
        </PageTitle>
    );
};

export default Payment;
