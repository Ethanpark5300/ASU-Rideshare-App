import React, { useEffect, useState } from 'react';
import { LoadScript, GoogleMap, Marker, MarkerF } from '@react-google-maps/api';

interface Location {
    lat: number;
    lng: number;
}

const LiveTracking: React.FC = () => {
    const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                    setErrorMessage('');
                },
                (error) => {
                    // console.error('Error getting user location:', error);
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
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={currentLocation || { lat: 0, lng: 0 }}
                    zoom={15}
                >
                    {currentLocation && <MarkerF position={currentLocation} />}
                </GoogleMap>
            </LoadScript>
        </div>
    );
};

export default LiveTracking;