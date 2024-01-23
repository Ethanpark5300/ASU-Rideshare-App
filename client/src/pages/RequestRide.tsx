import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';
import '../styles/RequestRide.css';
import PageTitle from '../components/Page_Title/PageTitle';

const libraries = ['places'] as any;

const RequestRide: React.FC = () => {
    const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 });
    const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
    const [mapLoaded, setMapLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [directions, setDirections] = useState<any>(null);
    const [distance, setDistance] = useState<string>('');
    const [duration, setDuration] = useState<string>('');

    const originAutocomplete = useRef<google.maps.places.Autocomplete>(null);
    const destinationAutocomplete = useRef<google.maps.places.Autocomplete>(null);

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

    const handleMapLoad = () => {
        setMapLoaded(true);
    };

    const handleDirectionsResponse = (response: any) => {
        if (response !== null && response.status === 'OK') {
            setDirections(response);
            const route = response.routes[0];
            if (route) {
                const distance = route.legs.reduce((acc: number, leg: any) => acc + leg.distance.value, 0);
                const duration = route.legs.reduce((acc: number, leg: any) => acc + leg.duration.value, 0);

                setDistance((distance / 1609.34).toFixed(2) + ' miles'); // Convert meters to miles
                setDuration((duration / 60).toFixed(2) + ' minutes'); // Convert seconds to minutes
            }
        } else {
            console.error('Error calculating directions:', response);
            /** @TODO Display error to the rider */
        }
    };

    const handlePreview = () => {
        if (origin && destination) {
            const directionsService = new window.google.maps.DirectionsService();

            directionsService.route(
                {
                    origin: origin,
                    destination: destination,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                handleDirectionsResponse
            );
        }
    };

    const handleUseCurrentLocation = () => {
        if (currentPosition.lat !== 0 && currentPosition.lng !== 0) {
            // Using the Geocoding API to get the address from coordinates
            const geocoder = new window.google.maps.Geocoder();
            const latlng = new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng);

            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === 'OK' && results && results.length > 0) {
                    const formattedAddress = results[0].formatted_address;
                    setOrigin(formattedAddress);
                } else {
                    console.error('Error getting address from coordinates:', status);
                    /** @TODO Display error to the rider */
                }
            });
        }
    };

    const handleOriginPlaceChanged = () => {
        if (originAutocomplete.current) {
            const place = originAutocomplete.current.getPlace();

            if (place && place.formatted_address) {
                setOrigin(place.formatted_address);
            }
        }
    };

    const handleDestinationPlaceChanged = () => {
        if (destinationAutocomplete.current) {
            const place = destinationAutocomplete.current.getPlace();

            if (place && place.formatted_address) {
                setDestination(place.formatted_address);
            }
        }
    };

    const handleClear = () => {
        setOrigin('');
        setDestination('');
    };

    const handleSubmit = () => {
        /**@TODO Send pick-up and drop-off location to rider request page */
        console.log('Pick-up Location:', origin);
        console.log('Drop-off Location:', destination);
    };

    return (
        <PageTitle title='Request Ride'>
            <main id='request-ride'>
                <aside className="search-bar">
                    <h1>Request Ride</h1>
                    <LoadScript
                        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
                        libraries={libraries}
                        onLoad={handleMapLoad}
                    >
                        <Autocomplete
                            onLoad={(autocomplete) => (originAutocomplete.current = autocomplete)}
                            onPlaceChanged={handleOriginPlaceChanged}
                        >
                            <input
                                type="text"
                                placeholder="Origin"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                            />
                        </Autocomplete>
                        <Autocomplete
                            onLoad={(autocomplete) => (destinationAutocomplete.current = autocomplete)}
                            onPlaceChanged={handleDestinationPlaceChanged}
                        >
                            <input
                                type="text"
                                placeholder="Destination"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                            />
                        </Autocomplete>
                        <div className="request-btns-container">
                            <button className='btn current-location-btn' onClick={handleUseCurrentLocation}>Use Current Location</button>
                            <button className='btn preview-btn' onClick={handlePreview}>Preview</button>
                            <button className='btn clear-btn' onClick={handleClear}>Clear</button>
                            <button className='btn request-btn' onClick={handleSubmit}>Submit</button>
                        </div>
                    </LoadScript>
                    {distance && duration && (
                        <div className='request-results-container'>
                            <p>Distance: {distance}</p>
                            <p>Duration: {duration}</p>
                        </div>
                    )}
                </aside>

                {error ? (
                    <p>{error}</p>
                ) : (
                    mapLoaded && (
                        <div>
                            {currentPosition.lat !== 0 && currentPosition.lng !== 0 && (
                                <div className="map-container">
                                    <GoogleMap mapContainerStyle={{ height: '100%', width: '100%' }} zoom={13} center={mapCenter}>
                                        {/* Marker for the user's current location */}
                                        <Marker position={currentPosition} />

                                        {/* DirectionsRenderer for the searched directions */}
                                        {directions && <DirectionsRenderer directions={directions} />}
                                    </GoogleMap>
                                </div>
                            )}
                        </div>
                    )
                )}
            </main>
        </PageTitle>
    );
};

export default RequestRide;