import { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api';
import "./GoogleMaps.css"

function MapContainer() {
    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });
    const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error('Error getting user location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, []);

    return (
        <div className="live-tracking-maps-container">
            {isLoaded && (
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    zoom={13}
                    center={currentPosition}
                >
                    {currentPosition && <MarkerF position={currentPosition} />}
                </GoogleMap>
            )}
        </div>
    );
};

export default MapContainer;