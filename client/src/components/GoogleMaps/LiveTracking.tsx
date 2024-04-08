import { useEffect, useState } from 'react';
import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api';
import "./GoogleMaps.css"

function LiveTracking() {
    const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
    const { isLoaded: mapsLoaded } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });

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

    return (
        <div className='live-tracking-maps-container'>
            {mapsLoaded && (
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={currentLocation}
                    zoom={19}
                >
                    {currentLocation && <MarkerF position={currentLocation} />}
                </GoogleMap>
            )}
        </div>
    );
};

export default LiveTracking;