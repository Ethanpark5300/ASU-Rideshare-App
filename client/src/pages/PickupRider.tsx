import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, MarkerF } from '@react-google-maps/api';
import PageTitle from '../components/PageTitle/PageTitle';
import "../styles/PickupRider.css";

interface PickupRiderProps {
    driverEmail: string;
}

const PickupRider: React.FC<PickupRiderProps> = (props) => {
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number }>(null);
    const [destinationAddress, setDestinationAddress] = useState<string>('');
    const [destinationLocation, setDestinationLocation] = useState<{ lat: number, lng: number }>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [mapLoaded, setMapLoaded] = useState<boolean>(false);
    const { isLoaded: mapsLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });
    const [estimatedTimeArrival, setEstimatedTimeArrival] = useState<string>('');
    const [estimatedRemainingDistance, setEstimatedRemainingDistance] = useState<string>('');
    const [arrivalTime, setArrivalTime] = useState<string>('');
    const [directionsResponse, setDirectionsResponse] = useState<any>(null);
    const [rideInfo, setRideInfo] = useState<any>();
    const [showDirections, setShowDirections] = useState<boolean>(false);

    useEffect(() => {
        const delay: number = 125;
        const timerId = setTimeout(() => {
            async function getRideInformation() {
                try {
                    const response = await fetch(`/get-ride-information?userid=${props.driverEmail}`);
                    const data = await response.json();
                    setRideInfo(data.driverRideInfo);
                    setDestinationAddress(data.driverRideInfo.Pickup_Location);
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
        if (!mapsLoaded || !destinationAddress) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: destinationAddress }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results.length > 0) {
                const location = results[0].geometry.location;
                setDestinationLocation({ lat: location.lat(), lng: location.lng() });
            } else {
                setErrorMessage('Geocode was not successful for the following reason: ' + status);
            }
        });
    }, [mapsLoaded, destinationAddress]);

    const calculateETA = () => {
        setShowDirections(false);

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: currentLocation,
                destination: destinationLocation,
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
                    setEstimatedRemainingDistance(remainingDistanceInMiles.toFixed(2) + ' miles');

                    const estimatedDurationInSeconds = leg.duration.value;
                    const arrivalTimeInMilliseconds = Date.now() + (estimatedDurationInSeconds * 1000);
                    setArrivalTime(new Date(arrivalTimeInMilliseconds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

                    setDirectionsResponse({ response, uniqueKey: Date.now() });
                } else {
                    setEstimatedTimeArrival('N/A');
                    setArrivalTime('N/A');
                    setEstimatedRemainingDistance('N/A');
                    setDirectionsResponse(null);
                }
            }
        );
    };

    const handleMapLoad = () => {
        setMapLoaded(true);
    };

    // Rider cancellation

    
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
                                zoom={18}
                                onLoad={handleMapLoad}
                            >
                                {currentLocation && <MarkerF position={currentLocation} />}
                                {destinationLocation && <MarkerF position={destinationLocation} />}
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
                            <p><b>Distance Remaining:</b> {estimatedRemainingDistance}</p>
                            <div className="pickup-rider-btns-container">
                                <button className='btn start-ride-btn'>Start Ride</button>
                                <button className="btn refresh-btn" onClick={calculateETA}>Refresh</button>
                                <button className='btn emergency-btn'>Emergency Services</button>
                            </div>
                        </>
                    )}
                </aside>
            </main>
        </PageTitle>
    );
};

export default PickupRider;