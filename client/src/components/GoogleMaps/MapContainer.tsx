import { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap, MarkerF, Libraries } from '@react-google-maps/api';
import CurrentLocationMarker from './CurrentLocationMarker.svg';
const libraries: Libraries = ['places'];

function MapContainer() {
    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, libraries: libraries });
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
        <>
            {isLoaded && (
                <GoogleMap
                    mapContainerStyle={{ width: '100vw', height: '100vh' }}
                    zoom={19}
                    center={currentPosition}
                    options={{ disableDefaultUI: true }}
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
        </>
    );
};

export default MapContainer;