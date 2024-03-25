import React, { useCallback, useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import "../styles/Payment.css"
import PageTitle from '../components/PageTitle/PageTitle';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const paypalOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
};

const Payment: React.FC = (props) => {
    const account = useAppSelector((state) => state.account);
    const [paypalLoaded, setPaypalLoaded] = useState<boolean>(false);
    const [paymentStatus, setPaymentStatus] = useState<string>('');
    const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);
    const [driverEmail, setDriverEmail] = useState<string>();
    const [driverFirstName, setDriverFirstName] = useState<string>();
    const [driverLastName, setDriverLastName] = useState<string>();
    const [driverPayPalEmail, setDriverPayPalEmail] = useState<string>();
    const [rideCost, setRideCost] = useState<number>();
    const [startButtonVisible, setStartButtonVisible] = useState<boolean>(true);
    const [cancelConfirmPromptVisible, setCancelConfirmPromptVisible] = useState<boolean>(false);
    const [cancellationDriverStatus, setCheckDriverCancellationStatus] = useState<string>();
    const [cancelledDriverPopup, setCancelledDriverPopup] = useState<boolean>(false);
    const navigate = useNavigate();

    //https://developer.paypal.com/docs/multiparty/checkout/standard/customize/buttons-style-guide/
    const buttonStyles = {
        color: 'gold' as const,
        shape: 'pill' as const,
        label: 'pay' as const,
    };
  
    const createOrder = (data: any, actions: any) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: rideCost,
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

    const onError = (error: any) => {
        setPaymentStatus('error');
        setShowErrorPopup(true);
    };

    const closeErrorPopup = () => {
        setShowErrorPopup(false);
    };

    const renderPopup = () => {
        if (paymentStatus === 'success') {
            try {
                fetch(`/send-payment`, {
                    method: "POST",
                    headers: { "Content-type": "application/json" },
                    body: JSON.stringify({
                        Rider_ID: account?.account?.email,
                        Driver_ID: driverEmail,
                        rideCost: rideCost,
                    }),
                })
            }
            catch (error: any) {
                console.error("Payment error:", error);
            }

            return (
                <div className="payment-success-popup">
                    <p>Payment has been successful!</p>
                    <Link to="/WaitingDriver">
                        <button>Next</button>
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

    const handleStartButtonClick = () => {
        setPaypalLoaded(true);
        setStartButtonVisible(false);
        setCancelConfirmPromptVisible(false);
    };

    const handleCancelRideRequest = () => {
        setCancelConfirmPromptVisible(true);
    }
    
    const handleDeclineCancel = () => {
        setCancelConfirmPromptVisible(false);
    }

    useEffect(() => {
        const delay : number = 125;
        const timerId = setTimeout(() => {
            async function getRidePaymentInformation() {
                try {
                    const response = await fetch(`/get-ride-payment-information?riderid=${account?.account?.email}`);
                    const data = await response.json();
                    setDriverEmail(data.driverEmail);
                    setDriverFirstName(data.driverFirstName);
                    setDriverLastName(data.driverLastName);
                    setDriverPayPalEmail(data.driverPayPalEmail);
                    setRideCost(data.rideCost);
                } catch (error) {
                    console.error("Error getting ride payment information:", error);
                }
            };
            getRidePaymentInformation();
        }, delay);

        return () => clearTimeout(timerId);
    }, [account?.account?.email]);

    const handleConfirmCancel = () => {
        try {
            fetch(`/cancel-ride-from-payment`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    riderid: account?.account?.email,
                }),
            })
            setCancelConfirmPromptVisible(false);
            navigate("/");
        }
        catch (error: any) {
            console.error("Error cancelling ride:", error);
        }
    }

    const checkDriverCancellationStatus = useCallback(async () => {
        try {
            const response = await fetch(`/check-driver-cancellation-status?riderid=${account?.account?.email}`);
            const data = await response.json();
            setCheckDriverCancellationStatus(data.getCancellationStatus);
        } catch (error) {
            console.log("Error checking driver cancellation status:", error);
        }
    }, [account?.account?.email]);
    
    useEffect(() => {
        const interval = setInterval(() => {
            checkDriverCancellationStatus();
            if (cancellationDriverStatus !== "CANCELLED(DRIVER)") return;
            setCancelledDriverPopup(true);
        }, 1000);
        return () => clearInterval(interval);
    }, [cancellationDriverStatus, checkDriverCancellationStatus]);

    return (
        <PageTitle title='Payment'>
            <main id="payment">
                <div className="payment-wrapper">
                    <div className="payment-container">
                        <h1>Payment</h1>
                        <div className="paypal-btns-container">
                            {startButtonVisible && (
                                <section className="start-payment-btns-container">
                                    <h2>Driver: {driverFirstName} {driverLastName}</h2>
                                    <h2>Ride Cost: ${rideCost}</h2>
                                    <button className='btn start-payment-btn' onClick={handleStartButtonClick}>Start Payment</button>
                                    <button className='btn cancel-ride-btn' onClick={handleCancelRideRequest}>Cancel Ride</button>
                                </section>
                            )}
                            {!startButtonVisible && (
                                <div className="payment-btns-container">
                                    <h2>Driver: {driverFirstName} {driverLastName}</h2>
                                    <h2>Ride Cost: ${rideCost}</h2>
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
                                    <div className="center-container">
                                        <button className='btn cancel-ride-btn' onClick={handleCancelRideRequest}>Cancel Ride</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/** @return successful/error popup depending on payment status */}
                {renderPopup()}

                {/** @return cancel warning popup */}
                {cancelConfirmPromptVisible && (
                    <div className='cancel-popup'>
                        <p>Are you sure you want to cancel the ride?</p>
                        <div className="cancel-btns-container">
                            <button className='confirm-cancel-btn' onClick={handleConfirmCancel}>Yes</button>
                            <button className='decline-cancel-btn' onClick={handleDeclineCancel}>No</button>
                        </div>
                    </div>
                )}
                
                {/** @return driver cancelling popup */}
                {cancelledDriverPopup && (
                    <div className='cancel-popup'>
                        <p>Sorry, driver has cancelled your ride.</p>
                        <Link to="/">
                            <button className='back-to-home-btn'>Back to Home</button>
                        </Link>
                    </div>
                )}
            </main>
        </PageTitle>
    );
};

export default Payment;