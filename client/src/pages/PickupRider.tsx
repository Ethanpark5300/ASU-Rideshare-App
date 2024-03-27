import React, { useCallback, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, MarkerF } from '@react-google-maps/api';
import PageTitle from '../components/PageTitle/PageTitle';
import "../styles/PickupRider.css";
import { Link, useNavigate } from 'react-router-dom';

interface PickupRiderProps {
    driverEmail: string;
}

const PickupRider: React.FC<PickupRiderProps> = (props) => {
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number }>(null);
    const [pickupAddress, setPickupAddress] = useState<string>('');
    const [pickupLocation, setPickupLocation] = useState<{ lat: number, lng: number }>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [mapLoaded, setMapLoaded] = useState<boolean>(false);
    const { isLoaded: mapsLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });
    const [estimatedTimeArrival, setEstimatedTimeArrival] = useState<string>('');
    const [estimatedRemainingDistance, setEstimatedRemainingDistance] = useState<number>();
    const [arrivalTime, setArrivalTime] = useState<string>('');
    const [directionsResponse, setDirectionsResponse] = useState<any>(null);
    const [rideInfo, setRideInfo] = useState<any>();
    const [showDirections, setShowDirections] = useState<boolean>(false);
    const [cancellationRiderStatus, setCheckRiderCancellationStatus] = useState<string>();
    const [cancelledRiderPopup, setCancelledRiderPopup] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const delay: number = 125;
        const timerId = setTimeout(() => {
            async function getRideInformation() {
                try {
                    const response = await fetch(`/get-ride-information?userid=${props.driverEmail}`);
                    const data = await response.json();
                    setRideInfo(data.driverRideInfo);
                    setPickupAddress(data.driverRideInfo.Pickup_Location);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };
            getRideInformation();
        }, delay);

        return () => clearTimeout(timerId);
    }, [props.driverEmail]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                    setErrorMessage('');
                    setMapLoaded(true);
                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        setErrorMessage('User denied the request for Geolocation.');
                    } else {
                        setErrorMessage('An error occurred while retrieving location.');
                    }
                }
            );
        } else {
            setErrorMessage('Geolocation is not supported by this browser.');
        }
    }, []);

    useEffect(() => {
        if (!mapsLoaded || !pickupAddress) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: pickupAddress }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results.length > 0) {
                const location = results[0].geometry.location;
                setPickupLocation({ lat: location.lat(), lng: location.lng() });
            } else {
                setErrorMessage('Geocode was not successful for the following reason: ' + status);
            }
        });
    }, [mapsLoaded, pickupAddress]);

    const calculateETA = () => {
        setShowDirections(false);

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: currentLocation,
                destination: pickupLocation,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (response, status) => {
                if (status === 'OK' && response.routes.length > 0) {
                    setShowDirections(true);

                    const route = response.routes[0];
                    const leg = route.legs[0];

                    const remainingDistanceInMeters = leg.distance.value;
                    const remainingDistanceInMiles = remainingDistanceInMeters * 0.000621371; // Convert meters to miles

                    setEstimatedTimeArrival(leg.duration.text);
                    setEstimatedRemainingDistance(Math.round(remainingDistanceInMiles));

                    const estimatedDurationInSeconds = leg.duration.value;
                    const arrivalTimeInMilliseconds = Date.now() + (estimatedDurationInSeconds * 1000);
                    setArrivalTime(new Date(arrivalTimeInMilliseconds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

                    setDirectionsResponse({ response, uniqueKey: Date.now() });
                } else {
                    setEstimatedTimeArrival('N/A');
                    setArrivalTime('N/A');
                    setEstimatedRemainingDistance(0);
                    setDirectionsResponse(null);
                }
            }
        );
    };

    const handleMapLoad = () => {
        setMapLoaded(true);
    };

    /** Checking if the rider cancelled the ride */
    const checkRiderCancellationStatus = useCallback(async () => {
        try {
            const response = await fetch(`/check-rider-cancellation-status?driverid=${props.driverEmail}`);
            const data = await response.json();
            setCheckRiderCancellationStatus(data.getCancellationStatus);
        } catch (error) {
            console.log("Error checking driver cancellation status:", error);
        }
    }, [props.driverEmail]);

    useEffect(() => {
        const interval = setInterval(() => {
            checkRiderCancellationStatus();
            if (cancellationRiderStatus !== "CANCELLED(RIDER)") return;
            setCancelledRiderPopup(true);
        }, 1000);
        return () => clearInterval(interval);
    }, [cancellationRiderStatus, checkRiderCancellationStatus]);

    /** Handling when driver arrives to pick-up point */
    useEffect(() => {
        const interval = setInterval(() => {
            if (estimatedRemainingDistance !== 0) return;
            async function updateDriverArrivedStatus() {
                try {
                    fetch(`/driver-arrived-pickup`, {
                        method: "POST",
                        headers: { "Content-type": "application/json" },
                        body: JSON.stringify({
                            driverid: props.driverEmail,
                        }),
                    })
                } catch (error) {
                    console.log("Error updating arrived ride status:", error);
                }
            }
            updateDriverArrivedStatus();
        }, 1000);
        return () => clearInterval(interval);
    }, [estimatedRemainingDistance, props.driverEmail]);
  
    /** Handling when the ride starts */
    async function startRide() {
        try {
            fetch(`/start-ride`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    driverid: props.driverEmail,
                }),
            })
        } catch (error) {
            console.log("Error starting ride:", error);
        }
    }

    const handleStartRide = () => {
        startRide();
        navigate("/RideInProgress");
    }

    return (
        <PageTitle title='Pickup Rider'>
            <main id='pickup-rider'>
                <div className="map-container">
                    <div style={{ width: '100%', height: '100vh', position: 'absolute' }}>
                        {errorMessage && (
                            <div className='error-message'>
                                {errorMessage}
                            </div>
                        )}
                        {mapLoaded && mapsLoaded && (
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={currentLocation || { lat: 0, lng: 0 }}
                                zoom={19}
                                onLoad={handleMapLoad}
                            >
                                {currentLocation && <MarkerF position={currentLocation} />}
                                {pickupLocation && <MarkerF position={pickupLocation} />}
                                {showDirections && directionsResponse && (
                                    <DirectionsRenderer
                                        key={directionsResponse.uniqueKey}
                                        directions={directionsResponse.response}
                                        options={{ suppressMarkers: true }}
                                    />
                                )}
                            </GoogleMap>
                        )}
                        {loadError && <div>Error loading Google Maps: {loadError.message}</div>}
                    </div>
                </div>
                <aside className="pickup-rider-info-container">
                    {(rideInfo) && (
                        <>
                            <h1>Pickup Rider</h1>
                            <p><b>Rider Name:</b> {rideInfo.Rider_FirstName} {rideInfo.Rider_LastName}</p>
                            <p><b>Pickup Location:</b> {rideInfo.Pickup_Location}</p>
                            <p><b>Estimated Arrival Time:</b> {arrivalTime} ({estimatedTimeArrival})</p>
                            <p><b>Distance Remaining:</b> {estimatedRemainingDistance} miles</p>
                            <div className="pickup-rider-btns-container">
                                {(estimatedRemainingDistance === 0) && (
                                    <>
                                        <button className='btn start-ride-btn' onClick={handleStartRide}>Start Ride</button>
                                        <button className='btn refresh-btn'>Contact Rider</button>
                                        <button className='btn emergency-btn'>Emergency Services</button>
                                    </>
                                )}
                                {(estimatedRemainingDistance !== 0) && (
                                    <>
                                        <button className='btn start-ride-btn'>Contact Rider</button>
                                        <button className="btn refresh-btn" onClick={calculateETA}>Refresh</button>
                                        <button className='btn emergency-btn'>Emergency Services</button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </aside>

                {/** @returns rider cancelled popup */}
                {cancelledRiderPopup && (
                    <div className="rider-cancelled-popup">
                        <p>Sorry, rider cancelled the ride</p>
                        <Link to="/">
                            <button className='btn back-to-home-btn'>Back to Home</button>
                        </Link>
                    </div>
                )}
            </main>
        </PageTitle>
    );
};

export default PickupRider;