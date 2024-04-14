import '../styles/Waiting.css'
import PageTitle from '../components/PageTitle/PageTitle';
import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import CancellationTimer from '../components/Timer/Timer';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, Libraries, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import CurrentLocationMarker from '../components/GoogleMaps/CurrentLocationMarker.svg';
import PickupLocationMarker from '../components/GoogleMaps/PickupLocationMarker.svg';
const libraries: Libraries = ['places'];

function WaitingDriver() {
    const account = useAppSelector((state) => state.account);
    const navigate = useNavigate();
    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, libraries: libraries });
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number }>(null);
    const [pickupAddress, setPickupAddress] = useState<string>();
    const [pickupLocation, setPickupLocation] = useState<{ lat: number, lng: number }>(null);
    const [riderRideInfo, setRiderRideInfo] = useState<any>();
    const [passedCancellation, setPassedCancellation] = useState<boolean>(false);
    const [beforeCancellationPopup, setBeforeCancellationPopup] = useState<boolean>(false);
    const [passedCancellationPopup, setPassedCancellationPopup] = useState<boolean>(false);
    const [cancellationDriverStatus, setCheckDriverCancellationStatus] = useState<string>();
    const [cancelledDriverPopup, setCancelledDriverPopup] = useState<boolean>(false);
    const [driverArrivedStatus, setDriverArrivedStatus] = useState<string>();
    const [driverArrivedPopup, setDriverArrivedPopup] = useState<boolean>(false);
    const [driverStarted, setDriverStarted] = useState<string>();

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        console.error('User denied the request for Geolocation.');
                    } else {
                        console.error('An error occurred while retrieving location.');
                    }
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, []);

    useEffect(() => {
        if (!isLoaded || !pickupAddress) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: pickupAddress }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results.length > 0) {
                const location = results[0].geometry.location;
                setPickupLocation({ lat: location.lat(), lng: location.lng() });
            } else {
                console.error('Geocode was not successful for the following reason: ' + status);
            }
        });
    }, [isLoaded, pickupAddress]);

    useEffect(() => {
        const delay = 125;
        const timerId = setTimeout(() => {
            async function getRideInformation() {
                try {
                    const response = await fetch(`/get-ride-information?userid=${account?.account?.email}`);
                    const data = await response.json();
                    setRiderRideInfo(data.riderRideInfo);
                    setPickupAddress(riderRideInfo.Pickup_Location);
                } catch (error) {
                    // console.error("Error fetching data:", error);
                }
            };
            getRideInformation();
        }, delay);
        return () => clearTimeout(timerId);
    }, [account?.account?.email, riderRideInfo]);

    const handleTimerEnd = () => {
        setPassedCancellation(true);
    };

    const handleCancelRequest = () => {
        if (!passedCancellation) return setBeforeCancellationPopup(true)
        else setPassedCancellationPopup(true)
    }

    const confirmCancel = async () => {
        try {
            fetch(`/cancel-ride`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userid: account?.account?.email,
                    passedCancellation: passedCancellation
                }),
            });
        } catch (error: any) {
            console.log("Error cancelling ride:", error);
        }
    };

    const handleConfirmCancel = () => {
        confirmCancel();
        navigate("/");
        setBeforeCancellationPopup(false);
        setPassedCancellationPopup(false);
    }

    const handleDeclineCancel = () => {
        setBeforeCancellationPopup(false);
        setPassedCancellationPopup(false);
    }

    /** Check if driver cancelled the ride */
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

    /** Check if driver arrived at the pick-up location */
    useEffect(() => {
        const interval = setInterval(() => {
            async function checkDriverArrivedStatus() {
                try {
                    const response = await fetch(`/check-if-driver-arrived?riderid=${account?.account?.email}`);
                    const data = await response.json();
                    setDriverArrivedStatus(data.getDriverArrivedStatus);
                } catch (error) {
                    // console.log("Error checking if driver arrived:", error);
                }
            }
            checkDriverArrivedStatus();
            if (driverArrivedStatus !== "WAITING(DRIVER)") return;
            setDriverArrivedPopup(true);
        }, 1000);
        return () => clearInterval(interval);
    }, [driverArrivedStatus, account?.account?.email]);

    /** Start ride when driver presses start ride */
    useEffect(() => {
        const interval = setInterval(() => {
            async function checkDriverStarted() {
                try {
                    const response = await fetch(`/check-if-driver-started-ride?riderid=${account?.account?.email}`);
                    const data = await response.json();
                    setDriverStarted(data.getDriverStartedStatus);
                } catch (error) {
                    // console.log("Error checking if driver started:", error);
                }
            }
            checkDriverStarted();
            if (driverStarted !== "ONGOING") return;
            navigate("/RideInProgress");
        }, 1000);
        return () => clearInterval(interval);
    }, [account?.account?.email, driverStarted, navigate]);

    return (
        <PageTitle title="Waiting Driver">
            <main id="waiting">
                {isLoaded && (
                    <GoogleMap
                        mapContainerStyle={{ height: '100vh', width: '100vw' }}
                        center={currentLocation}
                        zoom={19}
                        options={{ disableDefaultUI: true }}
                    >
                        <MarkerF
                            position={currentLocation}
                            icon={{
                                url: CurrentLocationMarker,
                                scaledSize: new window.google.maps.Size(25, 25),
                            }}
                        />
                        <MarkerF
                            position={pickupLocation}
                            icon={{
                                url: PickupLocationMarker,
                                scaledSize: new window.google.maps.Size(30, 40),
                            }}
                        />
                    </GoogleMap>
                )}
                <div className="waiting-container">
                    {(riderRideInfo) && (
                        <>
                            <h1>Waiting for Driver</h1>
                            <CancellationTimer initialMinutes={3} initialSeconds={0} onTimerEnd={handleTimerEnd} />
                            <p><b>Driver Name:</b> {riderRideInfo.First_Name} {riderRideInfo.Last_Name}</p>
                            <p><b>Pick-up Location:</b> {riderRideInfo.Pickup_Location}</p>
                            <p><b>Drop-off Location:</b> {riderRideInfo.Dropoff_Location}</p>
                            <div className="waiting-btns-container">
                                <button className='btn contact-btn'>Contact Driver</button>
                                <button className='btn emergency-btn'>Emergency Services</button>
                                <button className='btn cancel-btn' onClick={handleCancelRequest}>Cancel Ride</button>
                            </div>
                        </>
                    )}
                </div>

                {/** @returns before cancellation warning popup */}
                {beforeCancellationPopup && (
                    <div className="waiting-before-cancel-popup">
                        <h2>Cancellation Popup Warning</h2>
                        <p>Are you sure you want to cancel the ride?</p>
                        <div className="cancel-btns-container">
                            <button className='btn confirm-cancel-btn' onClick={handleConfirmCancel}>Yes</button>
                            <button className='btn decline-cancel-btn' onClick={handleDeclineCancel}>No</button>
                        </div>
                    </div>
                )}

                {/** @returns after cancellation warning popup */}
                {passedCancellationPopup && (
                    <div className="waiting-after-cancel-popup">
                        <h2>Cancellation Popup Warning</h2>
                        <p>Are you sure you want to cancel the ride?</p>
                        <p>You will recieve an warning on your account if you proceed.</p>
                        <div className="cancel-btns-container">
                            <button className='btn confirm-cancel-btn' onClick={handleConfirmCancel}>Yes</button>
                            <button className='btn decline-cancel-btn' onClick={handleDeclineCancel}>No</button>
                        </div>
                    </div>
                )}

                {/** @returns driver cancelled popup */}
                {cancelledDriverPopup && (
                    <div className='waiting-before-cancel-popup'>
                        <p>Sorry, driver has cancelled your ride.</p>
                        <button onClick={() => navigate("/")} className='back-to-home-btn'>Back to Home</button>
                    </div>
                )}

                {/** @returns driver arrived popup */}
                {driverArrivedPopup && (
                    <div className='driver-arrived-popup'>
                        <p>Your driver has arrived to your selected pick-up location.</p>
                    </div>
                )}
            </main>
        </PageTitle>
    );
}

export default WaitingDriver;