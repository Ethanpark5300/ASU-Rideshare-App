import { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, DirectionsRenderer, Autocomplete, MarkerF } from '@react-google-maps/api';
import '../styles/RequestRide.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { FaMapMarkerAlt } from "react-icons/fa";
import Select from 'react-select';
import buildingsData from '../components/BuildingSearch/Buildings.json';
import { useNavigate } from 'react-router-dom';
const libraries = ['places'] as any;

interface RequestRideProps {
    riderEmail: string;
}

const RequestRide: React.FC<RequestRideProps> = (props) => {
    const [currentPosition, setCurrentPosition] = useState({ lat: 0, lng: 0 });
    const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
    const [origin, setOrigin] = useState<string>('');
    const [destination, setDestination] = useState<string>('');
    const [directions, setDirections] = useState<any>(null);
    const [distance, setDistance] = useState<string>('');
    const [duration, setDuration] = useState<string>('');
    const [searchOriginFilter, setSearchOriginFilter] = useState<'normal' | 'building'>('normal');
    const [searchDestinationFilter, setSearchDestinationFilter] = useState<'normal' | 'building'>('normal');
    const originAutocomplete = useRef<google.maps.places.Autocomplete>(null);
    const destinationAutocomplete = useRef<google.maps.places.Autocomplete>(null);
    const [selectedOriginBuilding, setSelectedOriginBuilding] = useState<BuildingOption | null>(null);
    const [selectedDestinationBuilding, setSelectedDestinationBuilding] = useState<BuildingOption | null>(null);
    let [pickupLocation, setPickupLocation] = useState<string>(null);
    let [dropoffLocation, setDropoffLocation] = useState<string>(null);
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
        const geoWatchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({ lat: latitude, lng: longitude });
                setMapCenter({ lat: latitude, lng: longitude });
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    console.error('User denied the request for Geolocation.')
                } else {
                    console.log('An error occurred while retrieving location.')
                }
            }
        );

        return () => {
            navigator.geolocation.clearWatch(geoWatchId);
        };
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
                handleDirectionsResponse
            );
        }
    };

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
        }
    };

    const handleUseCurrentLocation = () => {
        if (currentPosition.lat !== 0 && currentPosition.lng !== 0) {
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
                                        riderid: props.riderEmail,
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
            console.log(error);
            alert('An error occurred. Please try again.');
        }
    };

    const buildingOptions: BuildingOption[] = buildingsData.buildings.map((building: Building) => ({
        value: building.code,
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
        setOrigin('');
        setSelectedOriginBuilding(null);
    };

    const handleDestinationSearchFilterChange = (filter: 'normal' | 'building') => {
        setSearchDestinationFilter(filter);
        setDestination('');
        setSelectedDestinationBuilding(null);
    };

    return (
        <PageTitle title='Request Ride'>
            <main id='request-ride'>
                <aside className="search-bar">
                    <header>
                        <h1>Request Ride</h1>
                    </header>
                    <LoadScript
                        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
                        libraries={libraries}
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
                                            placeholder="Pick-up Location..."
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
                                            placeholder="Drop-off Location..."
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
                            <button className='request-btn' onClick={handleSubmit}>Submit</button>
                            <button className='clear-btn' onClick={handleClear}>Clear</button>
                            <button className='preview-btn' onClick={handlePreview}>Preview</button>
                        </div>
                    </LoadScript>
                    {distance && duration && (
                        <div className='request-results-container'>
                            <p>Ride Cost: ${!isNaN(parseFloat(distance)) ? parseFloat(distance).toFixed(2) : 'N/A'}</p>
                            <p>Distance: {distance}</p>
                            <p>Duration: {duration}</p>
                        </div>
                    )}
                </aside>
                <div>
                    {currentPosition.lat !== 0 && currentPosition.lng !== 0 && (
                        <div className="map-container">
                            <GoogleMap
                                mapContainerStyle={{ height: '100%', width: '100%' }}
                                zoom={19}
                                center={mapCenter}
                            >
                                <MarkerF position={currentPosition} />
                                {directions && <DirectionsRenderer directions={directions} />}
                            </GoogleMap>
                        </div>
                    )}
                </div>
            </main>
        </PageTitle>
    );
};

export default RequestRide;