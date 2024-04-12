import { useEffect, useState } from 'react';
import { useJsApiLoader, GoogleMap, MarkerF, Libraries } from '@react-google-maps/api';
import CurrentLocationMarker from './CurrentLocationMarker.svg';
const libraries: Libraries = ['places'];

function LiveTracking() {
    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, libraries: libraries });
    const [currentPosition, setCurrentPosition] = useState<{ lat: number, lng: number }>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition({ lat: latitude, lng: longitude });
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
        <>
            {isLoaded && (
                <GoogleMap
                    mapContainerStyle={{ width: '100vw', height: '100vh' }}
                    center={currentPosition}
                    zoom={19}
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

export default LiveTracking;