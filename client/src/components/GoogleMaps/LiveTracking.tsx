import React, { useEffect, useState } from 'react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';

const LiveTracking: React.FC = () => {
    const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
    const [errorMessage, setErrorMessage] = useState<string>('');
    const { isLoaded: mapsLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                    setErrorMessage('');
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

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {errorMessage && (
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        zIndex: 1,
                    }}
                >
                    {errorMessage}
                </div>
            )}
            {mapsLoaded && (
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={currentLocation}
                    zoom={18}
                >
                    {currentLocation && <Marker position={currentLocation} />}
                </GoogleMap>
            )}
            {loadError && <div>Error loading map: {loadError.message}</div>}
        </div>
    );
};

export default LiveTracking;
