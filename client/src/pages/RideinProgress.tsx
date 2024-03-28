import React, { useCallback, useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, MarkerF } from '@react-google-maps/api';
import PageTitle from '../components/PageTitle/PageTitle';
import "../styles/RideinProgress.css";
import { useNavigate } from 'react-router-dom';

interface RideInProgressProps {
    userEmail: string;
    userType: number
}

const RideInProgress: React.FC<RideInProgressProps> = (props) => {
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number }>(null);
    const [dropoffAddress, setDropoffAddress] = useState<string>();
    const [dropoffLocation, setPickupLocation] = useState<{ lat: number, lng: number }>(null);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [mapLoaded, setMapLoaded] = useState<boolean>(false);
    const { isLoaded: mapsLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });
    const [estimatedTimeArrival, setEstimatedTimeArrival] = useState<string>();
    const [estimatedRemainingDistance, setEstimatedRemainingDistance] = useState<number>();
    const [arrivalTime, setArrivalTime] = useState<string>();
    const [directionsResponse, setDirectionsResponse] = useState<any>(null);
    const [riderRideInfo, setRiderRideInfo] = useState<any>();
    const [driverRideInfo, setDriverRideInfo] = useState<any>();
    const [showDirections, setShowDirections] = useState<boolean>(false);
    const [rideCompleted, setRideCompleted] = useState<string>();
    const navigate = useNavigate();

    useEffect(() => {
        const delay: number = 125;
        const timerId = setTimeout(() => {
            async function getRideInformation() {
                try {
                    const response = await fetch(`/get-ride-information?userid=${props.userEmail}`);
                    const data = await response.json();
                    setRiderRideInfo(data.riderRideInfo);
                    setDriverRideInfo(data.driverRideInfo);
                    setDropoffAddress(data.riderRideInfo.Dropoff_Location);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };
            getRideInformation();
        }, delay);

        return () => clearTimeout(timerId);
    }, [props.userEmail, riderRideInfo]);

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
        if (!mapsLoaded || !dropoffAddress) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: dropoffAddress }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results.length > 0) {
                const location = results[0].geometry.location;
                setPickupLocation({ lat: location.lat(), lng: location.lng() });
            } else {
                setErrorMessage('Geocode was not successful for the following reason: ' + status);
            }
        });
    }, [mapsLoaded, dropoffAddress]);

    const calculateETA = () => {
        setShowDirections(false);

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: currentLocation,
                destination: dropoffLocation,
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
                    setEstimatedRemainingDistance(Math.round(remainingDistanceInMiles * 10)/10);

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

    const completeRide = async () => {
        try {
            fetch(`/end-ride`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    driverid: props.userEmail,
                }),
            })
        }
        catch (error: any) {
            console.log("Error ending ride:", error);
        }
    };

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         async function checkRideEnded() {
    //             try {
    //                 const response = await fetch(`/check-if-ride-ended?userid=${props.userEmail}`);
    //                 const data = await response.json();
    //             } catch (error) {
    //                 console.log("Error checking if ride ended:", error);
    //             }
    //         }
    //         checkRideEnded();
    //     }, 1000);
    //     return () => clearInterval(interval);
    // }, [props.userEmail, navigate]);

    return (
        <PageTitle title='Ride in Progress'>
            <main id='ride-in-progress'>
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
                                center={currentLocation}
                                zoom={19}
                                onLoad={() => setMapLoaded(true)}
                            >
                                {currentLocation && <MarkerF position={currentLocation} />}
                                {dropoffLocation && <MarkerF position={dropoffLocation} />}
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

                <aside className="ride-in-progress-container">
                    {/** @returns Rider information */}
                    {(props.userType === 1 && riderRideInfo) && (
                        <>
                            <h1>Ride in Progress</h1>
                            <p><b>Driver Name:</b> {riderRideInfo.Driver_FirstName} {riderRideInfo.Driver_LastName} </p>
                            <p><b>Dropoff Point:</b> {riderRideInfo.Dropoff_Location} </p>
                            {(!arrivalTime) && (<p><b>Estimated Arrival Time:</b></p>)}
                            {(arrivalTime) && (<p><b>Estimated Arrival Time:</b> {arrivalTime} ({estimatedTimeArrival})</p>)}
                            {(!estimatedRemainingDistance) && (<p><b>Distance Remaining:</b></p>)}
                            {(estimatedRemainingDistance) && (<p><b>Distance Remaining:</b> {estimatedRemainingDistance} miles</p>)}
                            <div className="ride-in-progress-btns-container">
                                <button className='btn refresh-btn' onClick={calculateETA}>Refresh</button>
                                <button className='btn emergency-btn'>Emergency Services</button>
                            </div>
                        </>
                    )}

                    {/** @returns Driver information */}
                    {(props.userType === 2 && driverRideInfo) && (
                        <>
                            <h1>Ride in Progress</h1>
                            <p><b>Rider Name:</b> {driverRideInfo.Rider_FirstName} {driverRideInfo.Rider_LastName}</p>
                            <p><b>Dropoff Point:</b> {driverRideInfo.Dropoff_Location} </p>
                            {(!arrivalTime) && (<p><b>Estimated Arrival Time:</b> </p>)}
                            {(arrivalTime) && (<p><b>Estimated Arrival Time:</b> {arrivalTime} ({estimatedTimeArrival})</p>)}
                            {(estimatedRemainingDistance !== 0.0) && (<p><b>Distance Remaining:</b></p>)}
                            {(estimatedRemainingDistance === 0.0) && (<p><b>Distance Remaining:</b> {estimatedRemainingDistance} miles</p>)}

                            {/** @returns driver buttons while ride ongoing */}
                            {(estimatedRemainingDistance !== 0) && (
                                <div className="ride-in-progress-btns-container">
                                    <button className='btn refresh-btn' onClick={calculateETA}>Refresh</button>
                                    <button className='btn emergency-btn'>Emergency Services</button>
                                </div>
                            )}

                            {/** @returns driver buttons while ride completed */}
                            {(estimatedRemainingDistance === 0) && (
                                <div className="ride-in-progress-btns-container">
                                    <button className='btn end-ride-btn' onClick={completeRide}>End Ride</button>
                                    <button className='btn emergency-btn'>Emergency Services</button>
                                </div>
                            )}
                        </>
                    )}
                </aside>
            </main>
        </PageTitle>
    );
};

export default RideInProgress;