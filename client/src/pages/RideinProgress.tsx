import React, { useEffect, useState } from 'react';
import { LoadScriptNext, GoogleMap, Marker, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import PageTitle from '../components/PageTitle/PageTitle';
import "../styles/RideinProgress.css";

const RideinProgress: React.FC = () => {
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number }>(null);
    const [destinationAddress, setDestinationAddress] = useState<string>(''); // Initialize empty
    const [destinationLocation, setDestinationLocation] = useState<{ lat: number, lng: number }>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [mapLoaded, setMapLoaded] = useState<boolean>(false);
    const { isLoaded: mapsLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });
    const [estimatedTimeArrival, setEstimatedTimeArrival] = useState<string>(''); // State for estimated time of arrival
    const [arrivalTime, setArrivalTime] = useState<string>(''); // State for arrival time
    const [currentTime, setCurrentTime] = useState<string>(''); // State for current time

    let dropoffAddress = "301 E Orange St., Tempe, AZ 85281";

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                    setErrorMessage('');
                    setMapLoaded(true);
                    setDestinationAddress(dropoffAddress);
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

    useEffect(() => {
        if (currentLocation && destinationLocation) {
            const intervalId = setInterval(() => {
                calculateETA();
                updateCurrentTime();
            }, 1); // Update every minute
            calculateETA(); // Call initially to update arrival time immediately
            return () => clearInterval(intervalId); // Cleanup interval on component unmount
        }
    }, [currentLocation, destinationLocation]);


    const calculateETA = () => {
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: currentLocation,
                destination: destinationLocation,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (response, status) => {
                if (status === 'OK' && response.routes.length > 0) {
                    const route = response.routes[0];
                    const leg = route.legs[0];
                    setEstimatedTimeArrival(leg.duration.text); // Update estimated time of arrival
                    const estimatedDurationInSeconds = leg.duration.value;
                    const arrivalTimeInMilliseconds = Date.now() + (estimatedDurationInSeconds * 1000);
                    setArrivalTime(new Date(arrivalTimeInMilliseconds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                } else {
                    setEstimatedTimeArrival('N/A');
                    setArrivalTime('N/A');
                }
            }
        );
    };

    const updateCurrentTime = () => {
        setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    const handleMapLoad = () => {
        setMapLoaded(true);
    };

    return (
        <PageTitle title='Ride in Progress'>
            <main id='ride-in-progress'>
                <div className="map-container">
                    <div style={{ width: '100vw', height: '90.6vh', position: 'absolute' }}>
                        {errorMessage && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    zIndex: 0,
                                }}
                            >
                                {errorMessage}
                            </div>
                        )}
                        {mapLoaded && mapsLoaded && (
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={currentLocation || { lat: 0, lng: 0 }}
                                zoom={15}
                                onLoad={handleMapLoad}
                            >
                                {currentLocation && <MarkerF position={currentLocation} />}
                                {destinationLocation && <MarkerF position={destinationLocation} />}
                            </GoogleMap>
                        )}
                        {loadError && <div>Error loading Google Maps: {loadError.message}</div>}
                    </div>
                </div>
                <aside className="ride-info-container">
                    <h1>Ride in Progress</h1>
                    <p><b>Selected Destination:</b> {dropoffAddress} </p>
                    <p><b>Estimated Time Arrival:</b> {estimatedTimeArrival}</p>
                    <p><b>Current Time:</b> {currentTime}</p>
                    <p><b>Arrival Time:</b> {arrivalTime}</p>
                </aside>
            </main>
        </PageTitle>
    );
};

export default RideinProgress;