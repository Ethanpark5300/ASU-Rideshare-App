import { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api';
import CurrentLocationMarker from './CurrentLocationMarker.svg';
import "./GoogleMaps.css"

function MapContainer() {
    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY });
    const [currentPosition, setCurrentPosition] = useState<{ lat: number, lng: number }>(null);

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
                    zoom={19}
                    center={currentPosition}
                    options={{ streetViewControl: false }}
                >
                    <MarkerF
                        position={currentPosition}
                        icon={{
                            url: CurrentLocationMarker,
                            scaledSize: new window.google.maps.Size(25, 25),
                        }}
                    />
                </GoogleMap>
            )}
        </div>
    );
};

export default MapContainer;