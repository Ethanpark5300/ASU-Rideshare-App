import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import { useJsApiLoader } from '@react-google-maps/api';

const MapContainer: React.FC = () => {
    const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 });
    const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
    const [error, setError] = useState<string | null>(null);
    const { isLoaded: mapsLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition({ lat: latitude, lng: longitude });
                    setMapCenter({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error('Error getting user location:', error);
                    setError('Error getting user location. Please enable location services.');
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
            setError('Geolocation is not supported by this browser.');
        }
    }, []);

    const mapStyles = {
        height: '90.6vh',
        width: '100%',
    };

    return (
        <div>
            {error ? (
                <p>{error}</p>
            ) : (
                <LoadScript
                    googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
                    onLoad={() => { }}
                >
                    {mapsLoaded && (
                        <GoogleMap mapContainerStyle={mapStyles} zoom={13} center={mapCenter}>
                            <MarkerF position={currentPosition} />
                        </GoogleMap>
                    )}
                    {loadError && <div>Error loading map: {loadError.message}</div>}
                </LoadScript>
            )}
        </div>
    );
};

export default MapContainer;
