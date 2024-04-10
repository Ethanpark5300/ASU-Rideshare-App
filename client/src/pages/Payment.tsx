import { useCallback, useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import "../styles/Payment.css"
import PageTitle from '../components/PageTitle/PageTitle';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

const paypalOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
    currency: 'USD',
    disableFunding: 'paylater'
};

function Payment() {
    const account = useAppSelector((state) => state.account);
    const [paypalLoaded, setPaypalLoaded] = useState<boolean>(false);
    const [paymentStatus, setPaymentStatus] = useState<string>();
    const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);
    const [ridePaymentInformation, setRidePaymentInformation] = useState<any>([]);
    const [startButtonVisible, setStartButtonVisible] = useState<boolean>(true);
    const [cancelConfirmPromptVisible, setCancelConfirmPromptVisible] = useState<boolean>(false);
    const [cancellationDriverStatus, setCheckDriverCancellationStatus] = useState<string>();
    const [cancelledDriverPopup, setCancelledDriverPopup] = useState<boolean>(false);
    const navigate = useNavigate();

    const buttonStyles = {
        color: 'gold' as const,
        shape: 'pill' as const,
        label: 'pay' as const,
    };

    useEffect(() => {
        const delay = 125;
        const timerId = setTimeout(() => {
            async function getRidePaymentInformation() {
                try {
                    const response = await fetch(`/get-ride-payment-information?riderid=${account?.account?.email}`);
                    const data = await response.json();
                    setRidePaymentInformation(data.ridePaymentInformation);
                } catch (error) {
                    console.error("Error getting ride payment information:", error);
                }
            };
            getRidePaymentInformation();
        }, delay);

        return () => clearTimeout(timerId);
    }, [account?.account?.email]);

    const createOrder = (data: any, actions: any) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: ridePaymentInformation.Ride_Cost,
                    },
                    driver: {
                        email_address: ridePaymentInformation.Pay_Pal,
                    },
                },
            ],
        });
    };

    const onApprove = (data: any, actions: any) => {
        return actions.order.capture().then(function () {
            setPaymentStatus('success');
        });
    };

    const onError = () => {
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
                        Driver_ID: ridePaymentInformation.Driver_ID,
                        rideCost: ridePaymentInformation.Ride_Cost,
                    }),
                })
            }
            catch (error: any) {
                console.error("Payment error:", error);
            }

            return (
                <div className="payment-success-popup">
                    <p>Payment has been successful!</p>
                    <button onClick={() => navigate("/WaitingDriver")}>Next</button>
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
                                    <h2>Driver: {ridePaymentInformation.First_Name} {ridePaymentInformation.Last_Name}</h2>
                                    <h2>Ride Cost: ${ridePaymentInformation.Ride_Cost}</h2>
                                    <button className='btn start-payment-btn' onClick={handleStartButtonClick}>Start Payment</button>
                                    <button className='btn cancel-ride-btn' onClick={handleCancelRideRequest}>Cancel Ride</button>
                                </section>
                            )}
                            {!startButtonVisible && (
                                <div className="payment-btns-container">
                                    <h2>Driver: {ridePaymentInformation.First_Name} {ridePaymentInformation.Last_Name}</h2>
                                    <h2>Ride Cost: ${ridePaymentInformation.Ride_Cost}</h2>
                                    <PayPalScriptProvider options={paypalOptions}>
                                        {paypalLoaded && (
                                            <PayPalButtons
                                                createOrder={createOrder}
                                                onApprove={onApprove}
                                                onError={onError}
                                                style={buttonStyles}
                                            />
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
                        <button onClick={() => navigate("/")} className='back-to-home-btn'>Back to Home</button>
                    </div>
                )}
            </main>
        </PageTitle>
    );
};

export default Payment;