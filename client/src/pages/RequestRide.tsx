import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, Autocomplete, MarkerF } from '@react-google-maps/api';
import '../styles/RequestRide.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { FaMapMarkerAlt } from "react-icons/fa";
import Select from 'react-select';
import buildingsData from '../databases/Buildings.json';
import { useAppSelector } from '../store/hooks';
import { useNavigate } from 'react-router-dom';
const libraries = ['places'] as any;

interface RequestRideProps {
    riderEmail: string;
}

const RequestRide: React.FC<RequestRideProps> = (props) => {
    const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 });
    const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
    const [mapLoaded, setMapLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [directions, setDirections] = useState<any>(null);
    const [distance, setDistance] = useState<string>('');
    const [duration, setDuration] = useState<string>('');
    const [searchOriginFilter, setSearchOriginFilter] = useState<'normal' | 'building'>('normal');
    const [searchDestinationFilter, setSearchDestinationFilter] = useState<'normal' | 'building'>('normal');
    const originAutocomplete = useRef<google.maps.places.Autocomplete>(null);
    const destinationAutocomplete = useRef<google.maps.places.Autocomplete>(null);
    const [selectedOriginBuilding, setSelectedOriginBuilding] = useState<BuildingOption | null>(null);
    const [selectedDestinationBuilding, setSelectedDestinationBuilding] = useState<BuildingOption | null>(null);
    let pickupLocation, dropoffLocation;

    interface Building {
        code: string;
        name: string;
        address: string;
    }

    interface BuildingOption {
        value: string;
        label: string;
        address: string;
    }

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

    function getPickupLocation() {
        if (origin === null || origin === undefined || origin === "") {
            pickupLocation = selectedOriginBuilding.address
        }

        if (selectedOriginBuilding === null || selectedOriginBuilding.address === undefined || selectedOriginBuilding.address === "") {
            pickupLocation = origin
        }
    }

    function getDropoffLocation() {
        if (destination === null || destination === undefined || destination === "") {
            dropoffLocation = selectedDestinationBuilding.address
        }

        if (selectedDestinationBuilding === null || selectedDestinationBuilding.address === undefined || selectedDestinationBuilding.address === "") {
            dropoffLocation = destination
        }
    }

    const handleDirectionsResponse = (response: any) => {
        if (response !== null && response.status === 'OK') {
            setDirections(response);
            const route = response.routes[0];
            if (route) {
                const distance = route.legs.reduce((acc: number, leg: any) => acc + leg.distance.value, 0);
                const duration = route.legs.reduce((acc: number, leg: any) => acc + leg.duration.value, 0);

                setDistance((distance / 1609.34).toFixed(2) + ' miles'); // Convert meters to miles
                setDuration(Math.round(duration / 60) + ' minutes'); // Round duration to nearest whole number of minutes
            }
        } else {
            console.error('Error calculating directions:', response);
            /** @TODO Display error to the rider */
        }
    };

    const handlePreview = () => {
        getPickupLocation()
        getDropoffLocation()

        if (pickupLocation && dropoffLocation) {
            const directionsService = new window.google.maps.DirectionsService();

            directionsService.route(
                {
                    origin: pickupLocation,
                    destination: dropoffLocation,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                handleDirectionsResponse
            );
        }
    };

    const handleUseCurrentLocation = () => {
        if (currentPosition.lat !== 0 && currentPosition.lng !== 0) {
            // Clear the building search input and set selected building to null
            setOrigin('');
            setSelectedOriginBuilding(null);

            // Change the radio button to normal search
            setSearchOriginFilter('normal');

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
        setDirections(null);
        setDistance('');
        setDuration('');
        setSelectedOriginBuilding(null);
        setSelectedDestinationBuilding(null);
    };

    /**@TODO Send pickup and dropoff location */
    const handleSubmit = () => {
        try {
            getPickupLocation()
            getDropoffLocation()
            // console.log("Pickup Location: " + pickupLocation)
            // console.log("Dropoff Location: " + dropoffLocation)

            fetch(`/ride-queue`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    rider_id: props.riderEmail,
                    pickupLocation: pickupLocation,
                    dropoffLocation: dropoffLocation,
                }),
            })
        } catch(error) {
            console.log(error)
        }
    };

    const buildingOptions: BuildingOption[] = buildingsData.buildings.map((building: Building) => ({
        value: building.code,
        // label: `${building.code} - ${building.name} (${building.address})`,
        label: `${building.code} - ${building.name}`,
        address: building.address,
    }));

    const handleOriginBuildingChange = (selectedOption: BuildingOption | null) => {
        setSelectedOriginBuilding(selectedOption);
    };

    const handleDestinationBuildingChange = (selectedOption: BuildingOption | null) => {
        setSelectedDestinationBuilding(selectedOption);
    };

    const customOption = ({ innerProps, label, isFocused }: any) => (
        <div {...innerProps} className={isFocused ? 'option-focused' : 'option'}>
            <div>{label}</div>
        </div>
    );

    const handleOriginSearchFilterChange = (filter: 'normal' | 'building') => {
        setSearchOriginFilter(filter);
        // Clear origin input when switching filters
        setOrigin('');
        setSelectedOriginBuilding(null); // Clear selected building
    };

    const handleDestinationSearchFilterChange = (filter: 'normal' | 'building') => {
        setSearchDestinationFilter(filter);
        // Clear destination input when switching filters
        setDestination('');
        setSelectedDestinationBuilding(null); // Clear selected building
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
                        <div className="origin-container">
                            <div className="input-container">
                                <label htmlFor="origin" className='rr-label'>Pick-Up Location</label>
                                {searchOriginFilter === 'normal' ? (
                                    <Autocomplete
                                        onLoad={(autocomplete) => (originAutocomplete.current = autocomplete)}
                                        onPlaceChanged={handleOriginPlaceChanged}
                                    >
                                        <input
                                            type="text"
                                            name='origin'
                                            id='origin'
                                            placeholder="Origin"
                                            value={origin}
                                            onChange={(e) => setOrigin(e.target.value)}
                                        />
                                    </Autocomplete>
                                ) : (
                                    <Select
                                        options={buildingOptions}
                                        value={selectedOriginBuilding}
                                        onChange={handleOriginBuildingChange}
                                        isSearchable
                                        placeholder="Building Search"
                                        components={{ Option: customOption }}
                                        styles={{
                                            control: (provided: any) => ({
                                                ...provided,
                                                maxWidth: '275px',
                                            }),
                                        }}
                                    />
                                )}
                            </div>
                            <div className="current-location-tooltip">
                                <button
                                    className='current-location-btn'
                                    onClick={handleUseCurrentLocation}>
                                    <FaMapMarkerAlt />
                                </button>
                                <span className='current-location-tooltip-text'>Use Current Location</span>
                            </div>
                        </div>
                        <div className="search-filter-container">
                            <div className="normal-search-container">
                                <input
                                    type="radio"
                                    name="origin-search-filter"
                                    id="origin-normal-search"
                                    checked={searchOriginFilter === 'normal'}
                                    onChange={() => handleOriginSearchFilterChange('normal')}
                                />
                                <label htmlFor="origin-normal-search">Normal Search</label>
                            </div>
                            <div className="building-search-container">
                                <input
                                    type="radio"
                                    name="origin-search-filter"
                                    id="origin-building-search"
                                    checked={searchOriginFilter === 'building'}
                                    onChange={() => handleOriginSearchFilterChange('building')}
                                />
                                <label htmlFor="origin-building-search">Building Search</label>
                            </div>
                        </div>

                        <div className="destination-container">
                            <div className="input-container">
                                <label htmlFor="destination" className='rr-label'>Drop-Off Location</label>
                                {searchDestinationFilter === 'normal' ? (
                                    <Autocomplete
                                        onLoad={(autocomplete) => (destinationAutocomplete.current = autocomplete)}
                                        onPlaceChanged={handleDestinationPlaceChanged}
                                    >
                                        <input
                                            type="text"
                                            name='destination'
                                            id='destination'
                                            placeholder="Destination"
                                            value={destination}
                                            onChange={(e) => setDestination(e.target.value)}
                                        />
                                    </Autocomplete>
                                ) : (
                                    <Select
                                        name='destination'
                                        id='destination'
                                        options={buildingOptions}
                                        value={selectedDestinationBuilding}
                                        onChange={handleDestinationBuildingChange}
                                        isSearchable
                                        placeholder="Building Search"
                                        components={{ Option: customOption }}
                                        styles={{
                                            control: (provided: any) => ({
                                                ...provided,
                                                maxWidth: '275px',
                                            }),
                                        }}
                                    />
                                )}
                            </div>

                        </div>
                        <div className={`search-filter-container ${searchDestinationFilter === 'building' ? 'search-filter-margin' : ''}`}>
                            <div className="normal-search-container">
                                <input
                                    type="radio"
                                    name="destination-search-filter"
                                    id="destination-normal-search"
                                    checked={searchDestinationFilter === 'normal'}
                                    onChange={() => handleDestinationSearchFilterChange('normal')}
                                />
                                <label htmlFor="destination-normal-search">Normal Search</label>
                            </div>
                            <div className="building-search-container">
                                <input
                                    type="radio"
                                    name="destination-search-filter"
                                    id="destination-building-search"
                                    checked={searchDestinationFilter === 'building'}
                                    onChange={() => handleDestinationSearchFilterChange('building')}
                                />
                                <label htmlFor="destination-building-search">Building Search</label>
                            </div>
                        </div>

                        <div className="request-btns-container">
                            <button className='preview-btn' onClick={handlePreview}>Directions</button>
                            <button className='clear-btn' onClick={handleClear}>Clear</button>
                            <button className='request-btn' onClick={handleSubmit}>Submit</button>
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
                    <p className='request-error'>{error}</p>
                ) : (
                    mapLoaded && (
                        <div>
                            {currentPosition.lat !== 0 && currentPosition.lng !== 0 && (
                                <div className="map-container">
                                    <GoogleMap mapContainerStyle={{ height: '100%', width: '100%' }} zoom={13} center={mapCenter}>
                                        {/* Marker for the user's current location */}
                                        <MarkerF position={currentPosition} />

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