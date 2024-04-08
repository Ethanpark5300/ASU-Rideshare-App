import { useCallback, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, MarkerF } from '@react-google-maps/api';
import PageTitle from '../components/PageTitle/PageTitle';
import "../styles/PickupRider.css";
import { useNavigate } from 'react-router-dom';

interface PickupRiderProps {
    driverid: string;
}

function PickupRider({ driverid }: PickupRiderProps) {
    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number }>(null);
    const [pickupAddress, setPickupAddress] = useState<string>();
    const [pickupLocation, setPickupLocation] = useState<{ lat: number, lng: number }>(null);
    const [estimatedTimeArrival, setEstimatedTimeArrival] = useState<string>();
    const [estimatedRemainingDistance, setEstimatedRemainingDistance] = useState<number>();
    const [arrivalTime, setArrivalTime] = useState<string>();
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
                    const response = await fetch(`/get-ride-information?userid=${driverid}`);
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
    }, [driverid]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        console.error("User denied the request for Geolocation.")
                    } else {
                        console.error("An error occurred while retrieving location.")
                    }
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.")
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
                console.error("Geocode was not successful for the following reason: " + status);
            }
        });
    }, [isLoaded, pickupAddress]);

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
                    setEstimatedRemainingDistance(Math.round(remainingDistanceInMiles * 10) / 10);

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

    /** Checking if the rider cancelled the ride */
    const checkRiderCancellationStatus = useCallback(async () => {
        try {
            const response = await fetch(`/check-rider-cancellation-status?driverid=${driverid}`);
            const data = await response.json();
            setCheckRiderCancellationStatus(data.getCancellationStatus);
        } catch (error) {
            // console.log("Error checking driver cancellation status:", error);
        }
    }, [driverid]);

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
            if (estimatedRemainingDistance !== 0.0) return;
            async function updateDriverArrivedStatus() {
                try {
                    fetch(`/driver-arrived-pickup`, {
                        method: "POST",
                        headers: { "Content-type": "application/json" },
                        body: JSON.stringify({
                            driverid: driverid,
                        }),
                    })
                } catch (error) {
                    console.log("Error updating arrived ride status:", error);
                }
            }
            updateDriverArrivedStatus();
        }, 1000);
        return () => clearInterval(interval);
    }, [estimatedRemainingDistance, driverid]);

    /** Handling when the ride starts */
    async function startRide() {
        try {
            fetch(`/start-ride`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    driverid: driverid,
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
                    {isLoaded && (
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '100%' }}
                            center={currentLocation}
                            zoom={19}
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
                </div>
                <aside className="pickup-rider-info-container">
                    {(rideInfo) && (
                        <>
                            <h1>Pickup Rider</h1>
                            <p><b>Rider Name:</b> {rideInfo.First_Name} {rideInfo.Last_Name}</p>
                            <p><b>Pickup Location:</b> {rideInfo.Pickup_Location}</p>
                            {(!arrivalTime) && (<p><b>Estimated Arrival Time:</b></p>)}
                            {(arrivalTime) && (<p><b>Estimated Arrival Time:</b> {arrivalTime} ({estimatedTimeArrival})</p>)}
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
                                        <button className='btn emergency-btn'>Emergency Services</button>
                                        <button className="btn refresh-btn" onClick={calculateETA}>Refresh</button>
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
                        <button onClick={() => navigate("/")} className='btn back-to-home-btn'>Back to Home</button>
                    </div>
                )}
            </main>
        </PageTitle>
    );
};

export default PickupRider;