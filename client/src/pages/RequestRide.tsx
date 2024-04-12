import { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Autocomplete, Libraries, Marker, MarkerF } from '@react-google-maps/api';
import '../styles/RequestRide.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { FaMapMarkerAlt } from "react-icons/fa";
import Select from 'react-select';
import buildingsData from '../components/BuildingSearch/Buildings.json';
import { useNavigate } from 'react-router-dom';
import CurrentLocationMarker from '../components/GoogleMaps/CurrentLocationMarker.svg';
import PickupLocationMarker from '../components/GoogleMaps/PickupLocationMarker.svg';
import DropoffLocationMarker from '../components/GoogleMaps/DropoffLocationMarker.svg';
const libraries: Libraries = ['places'];

interface RequestRideProps {
    riderid: string;
}

function RequestRide({ riderid }: RequestRideProps) {
    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, libraries: libraries });
    const [currentPosition, setCurrentPosition] = useState<{ lat: number, lng: number }>(null);
    const [origin, setOrigin] = useState<string>('');
    const [destination, setDestination] = useState<string>('');
    const [directions, setDirections] = useState<any>(null);
    const [distance, setDistance] = useState<string>('');
    const [duration, setDuration] = useState<number>();
    const [searchOriginFilter, setSearchOriginFilter] = useState<'normal' | 'building'>('normal');
    const [searchDestinationFilter, setSearchDestinationFilter] = useState<'normal' | 'building'>('normal');
    const originAutocomplete = useRef<google.maps.places.Autocomplete>(null);
    const destinationAutocomplete = useRef<google.maps.places.Autocomplete>(null);
    const [selectedOriginBuilding, setSelectedOriginBuilding] = useState<BuildingOption | null>(null);
    const [selectedDestinationBuilding, setSelectedDestinationBuilding] = useState<BuildingOption | null>(null);
    let [pickupLocation, setPickupLocation] = useState<string>(null);
    let [dropoffLocation, setDropoffLocation] = useState<string>(null);
    const [pickupCoordinates, setPickupCoordinates] = useState<{ lat: number, lng: number }>(null);
    const [dropoffCoordinates, setDropoffCoordinates] = useState<{ lat: number, lng: number }>(null);
    const navigate = useNavigate();

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
                },
                (error) => {
                    console.error('Error getting user location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, []);

    function getPickupLocation() {
        let updatedPickupLocation = '';
        if (origin === null || origin === "") {
            updatedPickupLocation = selectedOriginBuilding ? selectedOriginBuilding.address : '';
            setPickupLocation(updatedPickupLocation);
        } else {
            updatedPickupLocation = origin;
            setPickupLocation(updatedPickupLocation);
        }
        return updatedPickupLocation;
    }

    function getDropoffLocation() {
        let updatedDropoffLocation = '';
        if (destination === null || destination === "") {
            updatedDropoffLocation = selectedDestinationBuilding ? selectedDestinationBuilding.address : '';
            setDropoffLocation(updatedDropoffLocation);
        } else {
            updatedDropoffLocation = destination;
            setDropoffLocation(updatedDropoffLocation);
        }
        return updatedDropoffLocation;
    }

    const handlePreview = () => {
        pickupLocation = getPickupLocation();
        dropoffLocation = getDropoffLocation();

        if (pickupLocation && dropoffLocation) {
            const directionsService = new window.google.maps.DirectionsService();

            directionsService.route(
                {
                    origin: pickupLocation,
                    destination: dropoffLocation,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (response, status) => {
                    if (status === 'OK') {
                        setDirections(response);
                        const route = response.routes[0];
                        if (route) {
                            const distance = route.legs.reduce((acc: number, leg: any) => acc + leg.distance.value, 0);
                            const duration = route.legs.reduce((acc: number, leg: any) => acc + leg.duration.value, 0);

                            setDistance((distance / 1609.34).toFixed(2)); // Convert meters to miles
                            setDuration(Math.round(duration / 60)); // Round duration to nearest whole number of minutes

                            setPickupCoordinates({ lat: route.legs[0].start_location.lat(), lng: route.legs[0].start_location.lng() });
                            setDropoffCoordinates({ lat: route.legs[0].end_location.lat(), lng: route.legs[0].end_location.lng() });
                        }
                    } else {
                        console.error('Error calculating directions:', status);
                        alert('Error calculating directions. Please try again.');
                    }
                }
            );
        }
    };

    const handleUseCurrentLocation = () => {
        if (currentPosition === null) return;

        setOrigin('');
        setSelectedOriginBuilding(null);
        setSearchOriginFilter('normal');

        const geocoder = new window.google.maps.Geocoder();
        const latlng = new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng);

        geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
                const formattedAddress = results[0].formatted_address;
                setOrigin(formattedAddress);
            } else {
                console.error('Error getting address from coordinates:', status);
            }
        });
    };

    const handleOriginPlaceChanged = () => {
        if (originAutocomplete.current) {
            const place = originAutocomplete.current.getPlace();

            if (place && place.formatted_address) {
                setOrigin(place.formatted_address || '');
            }
        }
    };

    const handleDestinationPlaceChanged = () => {
        if (destinationAutocomplete.current) {
            const place = destinationAutocomplete.current.getPlace();

            if (place && place.formatted_address) {
                setDestination(place.formatted_address || '');
            }
        }
    };

    const handleClear = () => {
        setOrigin(null);
        setDestination(null);
        setDirections(null);
        setDistance(null);
        setDuration(null);
        setSelectedOriginBuilding(null);
        setSelectedDestinationBuilding(null);
        setPickupCoordinates(null);
        setDropoffCoordinates(null);
    };

    const handleSubmit = () => {
        try {
            pickupLocation = getPickupLocation();
            dropoffLocation = getDropoffLocation();

            if (pickupLocation && dropoffLocation) {
                const directionsService = new window.google.maps.DirectionsService();

                directionsService.route(
                    {
                        origin: pickupLocation,
                        destination: dropoffLocation,
                        travelMode: window.google.maps.TravelMode.DRIVING,
                    },
                    (response, status) => {
                        if (status === 'OK') {
                            const route = response.routes[0];
                            if (route) {
                                const distance = route.legs.reduce((acc: number, leg: any) => acc + leg.distance.value, 0);
                                const distanceInMiles = (distance / 1609.34).toFixed(2); // Convert meters to miles

                                fetch(`/ride-queue`, {
                                    method: "POST",
                                    headers: { "Content-type": "application/json" },
                                    body: JSON.stringify({
                                        riderid: riderid,
                                        pickupLocation: pickupLocation,
                                        dropoffLocation: dropoffLocation,
                                        rideCost: distanceInMiles,
                                    }),
                                });
                                navigate("/ChooseDriver");
                            }
                        } else {
                            console.error('Error calculating directions:', status);
                            alert('Error calculating directions. Please try again.');
                        }
                    }
                );
            } else {
                alert('Please provide both pick-up and drop-off locations.');
            }
        } catch (error) {
            console.log("Error submitting request", error);
            alert('An error occurred. Please try again.');
        }
    };

    const buildingOptions: BuildingOption[] = buildingsData.buildings.map((building: Building) => ({
        value: building.code,
        // label: `${building.code} - ${building.name}`,
        label: `${building.code} - ${building.name} (${building.address})`,
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
        setOrigin(null);
        setSelectedOriginBuilding(null);
    };

    const handleDestinationSearchFilterChange = (filter: 'normal' | 'building') => {
        setSearchDestinationFilter(filter);
        setDestination(null);
        setSelectedDestinationBuilding(null);
    };

    return (
        <PageTitle title='Request Ride'>
            <main id='request-ride'>
                <aside className="search-bar">
                    <header><h1>Request Ride</h1></header>
                    {isLoaded && (
                        <>
                            {/* Pick-up location input */}
                            <div className="origin-container">
                                <div className="input-container">
                                    <label htmlFor="origin" className='rr-label'>Pick-Up Location</label>
                                    {searchOriginFilter === 'normal' ? (
                                        <Autocomplete
                                            onLoad={(autocomplete) => (originAutocomplete.current = autocomplete)}
                                            onPlaceChanged={handleOriginPlaceChanged}
                                            options={{
                                                types: ['establishment'],
                                                strictBounds: true,
                                                bounds: new window.google.maps.LatLngBounds(
                                                    new window.google.maps.LatLng(31.332177, -114.818268), // Southwest corner of Arizona
                                                    new window.google.maps.LatLng(37.00426, -109.045223) // Northeast corner of Arizona
                                                )
                                            }}
                                        >
                                            <input
                                                type="text"
                                                name='origin'
                                                id='origin'
                                                placeholder="Pick-up Location..."
                                                value={origin || ''}
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
                                            styles={{ control: (provided: any) => ({ ...provided, maxWidth: '275px' }) }}
                                        />
                                    )}
                                </div>

                                {/* Current location button */}
                                <div className="current-location-tooltip">
                                    <button
                                        className='current-location-btn'
                                        onClick={handleUseCurrentLocation}>
                                        <FaMapMarkerAlt />
                                    </button>
                                    <span className='current-location-tooltip-text'>Use Current Location</span>
                                </div>
                            </div>

                            {/* Pick-up search radio buttons */}
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

                            {/* Drop-off location input */}
                            <div className="destination-container">
                                <div className="input-container">
                                    <label htmlFor="destination" className='rr-label'>Drop-Off Location</label>
                                    {searchDestinationFilter === 'normal' ? (
                                        <Autocomplete
                                            onLoad={(autocomplete) => (destinationAutocomplete.current = autocomplete)}
                                            onPlaceChanged={handleDestinationPlaceChanged}
                                            options={{
                                                types: ['establishment'],
                                                strictBounds: true,
                                                bounds: new window.google.maps.LatLngBounds(
                                                    new window.google.maps.LatLng(31.332177, -114.818268), // Southwest corner of Arizona
                                                    new window.google.maps.LatLng(37.00426, -109.045223) // Northeast corner of Arizona
                                                )
                                            }}
                                        >
                                            <input
                                                type="text"
                                                name='destination'
                                                id='destination'
                                                placeholder="Drop-off Location..."
                                                value={destination || ''}
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
                                            styles={{ control: (provided: any) => ({ ...provided, maxWidth: '275px', }) }}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Drop-off search radio buttons */}
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

                            {/* Submit, preview, and clear buttons */}
                            <div className="request-btns-container">
                                <button className='request-btn' onClick={handleSubmit}>Submit</button>
                                <button className='preview-btn' onClick={handlePreview}>Preview</button>
                                <button className='clear-btn' onClick={handleClear}>Clear</button>
                            </div>

                            {/* Preview output */}
                            {distance && duration && (
                                <div className='request-results-container'>
                                    <p><b>Ride Cost:</b> ${distance}</p>
                                    <p><b>Distance:</b> {distance} miles</p>
                                    <p><b>Duration:</b> {duration} minutes</p>
                                </div>
                            )}
                        </>
                    )}
                </aside>
                {isLoaded && (
                    <GoogleMap
                        mapContainerStyle={{ height: '100vh', width: '100vw' }}
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
                        {directions && (
                            <>
                                <Marker
                                    position={pickupCoordinates}
                                    icon={{
                                        url: PickupLocationMarker,
                                        scaledSize: new window.google.maps.Size(30, 40),
                                    }}
                                />
                                <Marker
                                    position={dropoffCoordinates}
                                    icon={{
                                        url: DropoffLocationMarker,
                                        scaledSize: new window.google.maps.Size(30, 40),
                                    }}
                                />
                                <DirectionsRenderer
                                    directions={directions}
                                    options={{
                                        suppressMarkers: true,
                                        polylineOptions: {
                                            strokeColor: '#8C1D40',
                                            strokeWeight: 5,
                                        },
                                    }}
                                />
                            </>
                        )}
                    </GoogleMap>
                )}
            </main>
        </PageTitle>
    );
}

export default RequestRide;