import { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, MarkerF, Libraries } from '@react-google-maps/api';
import PageTitle from '../components/PageTitle/PageTitle';
import "../styles/RideinProgress.css";
import { useNavigate } from 'react-router-dom';
import CurrentLocationMarker from '../components/GoogleMaps/CurrentLocationMarker.svg';
import DropoffLocationMarker from '../components/GoogleMaps/DropoffLocationMarker.svg';
const libraries: Libraries = ['places'];

interface RideInProgressProps {
    userid: string;
}

function RideinProgress({ userid }: RideInProgressProps) {
    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, libraries: libraries });
    const [userType, setUserType] = useState<number>();
    const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number }>(null);
    const [dropoffAddress, setDropoffAddress] = useState<string>();
    const [dropoffLocation, setPickupLocation] = useState<{ lat: number, lng: number }>(null);
    const [estimatedTimeArrival, setEstimatedTimeArrival] = useState<string>();
    const [estimatedRemainingDistance, setEstimatedRemainingDistance] = useState<number>();
    const [arrivalTime, setArrivalTime] = useState<string>();
    const [directionsResponse, setDirectionsResponse] = useState<any>(null);
    const [riderRideInfo, setRiderRideInfo] = useState<any>();
    const [driverRideInfo, setDriverRideInfo] = useState<any>();
    const [showDirections, setShowDirections] = useState<boolean>(false);
    const [checkRideCompleted, setCheckRideCompleted] = useState<string>();
    const navigate = useNavigate();

    useEffect(() => {
        async function getAccountInformation() {
            try {
                const response = await fetch(`/view-account-info?accountEmail=${userid}`);
                const data = await response.json();
                if (data.account) setUserType(data.account.Type_User);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        getAccountInformation();
    }, [userid])

    useEffect(() => {
        const delay = 125;
        const timerId = setTimeout(() => {
            async function getRideInformation() {
                try {
                    const response = await fetch(`/get-ride-information?userid=${userid}`);
                    const data = await response.json();
                    setRiderRideInfo(data.riderRideInfo);
                    setDriverRideInfo(data.driverRideInfo);
                    setDropoffAddress(data.riderRideInfo.Dropoff_Location);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            };
            getRideInformation();
        }, delay);
        return () => clearTimeout(timerId);
    }, [userid, riderRideInfo]);

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

    useEffect(() => {
        if (!isLoaded || !dropoffAddress) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: dropoffAddress }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results.length > 0) {
                const location = results[0].geometry.location;
                setPickupLocation({ lat: location.lat(), lng: location.lng() });
            } else {
                console.error('Geocode was not successful for the following reason: ' + status);
            }
        });
    }, [isLoaded, dropoffAddress]);

    const calculateETA = () => {
        setShowDirections(null);

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: currentLocation,
                destination: dropoffLocation,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (response, status) => {
                if (status === 'OK' && response.routes.length > 0) {
                    setShowDirections(true);

                    const route = response.routes[0];
                    const leg = route.legs[0];

                    const remainingDistanceInMeters = leg.distance.value;
                    const remainingDistanceInMiles = remainingDistanceInMeters * 0.000621371; // Convert meters to miles

                    setEstimatedTimeArrival(leg.duration.text);
                    setEstimatedRemainingDistance(Math.round(remainingDistanceInMiles * 10) / 10);

                    const estimatedDurationInSeconds = leg.duration.value;
                    const arrivalTimeInMilliseconds = Date.now() + (estimatedDurationInSeconds * 1000);
                    setArrivalTime(new Date(arrivalTimeInMilliseconds).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

                    setDirectionsResponse({ response, uniqueKey: Date.now() });
                } else {
                    setEstimatedTimeArrival('N/A');
                    setArrivalTime('N/A');
                    setEstimatedRemainingDistance(0);
                    setDirectionsResponse(null);
                }
            }
        );
    };

    const completeRide = async () => {
        try {
            fetch(`/end-ride`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    driverid: userid,
                }),
            })
        }
        catch (error) {
            console.error("Error ending ride:", error);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            async function checkRideEnded() {
                try {
                    const response = await fetch(`/check-if-ride-ended?userid=${userid}`);
                    const data = await response.json();
                    setCheckRideCompleted(data.rideStatus);
                } catch (error) {
                    console.error("Error checking if ride ended:", error);
                }
            }
            checkRideEnded();
            if (checkRideCompleted !== "COMPLETED") return;
            navigate("/Rating");
        }, 1000);
        return () => clearInterval(interval);
    }, [userid, checkRideCompleted, navigate]);

    return (
        <PageTitle title='Ride in Progress'>
            <main id='ride-in-progress'>
                {isLoaded && (
                    <GoogleMap
                        mapContainerStyle={{ width: '100vw', height: '100vh' }}
                        center={currentLocation}
                        zoom={19}
                        options={{ disableDefaultUI: true }}
                    >
                        <MarkerF
                            position={currentLocation}
                            icon={{
                                url: CurrentLocationMarker,
                                scaledSize: new window.google.maps.Size(25, 25),
                            }}
                        />
                        <MarkerF
                            position={dropoffLocation}
                            icon={{
                                url: DropoffLocationMarker,
                                scaledSize: new window.google.maps.Size(30, 40),
                            }}
                        />
                        {showDirections && (
                            <DirectionsRenderer
                                key={directionsResponse.uniqueKey}
                                directions={directionsResponse.response}
                                options={{
                                    suppressMarkers: true,
                                    polylineOptions: {
                                        strokeColor: '#8C1D40',
                                        strokeWeight: 5,
                                    },
                                }}
                            />
                        )}
                    </GoogleMap>
                )}

                <aside className="ride-in-progress-container">
                    
                    {/** Rider information */}
                    {(userType === 1 && riderRideInfo) && (
                        <>
                            <h1>Ride in Progress</h1>
                            <p><b>Driver Name:</b> {riderRideInfo.First_Name} {riderRideInfo.Last_Name} </p>
                            <p><b>Dropoff Point:</b> {riderRideInfo.Dropoff_Location} </p>
                            {(!arrivalTime) && (<p><b>Estimated Arrival Time:</b></p>)}
                            {(arrivalTime) && (<p><b>Estimated Arrival Time:</b> {arrivalTime} ({estimatedTimeArrival})</p>)}
                            {(!estimatedRemainingDistance) && (<p><b>Distance Remaining:</b></p>)}
                            {(estimatedRemainingDistance) && (<p><b>Distance Remaining:</b> {estimatedRemainingDistance} miles</p>)}
                            <div className="ride-in-progress-btns-container">
                                <button className='btn refresh-btn' onClick={calculateETA}>Refresh</button>
                                <button className='btn emergency-btn'>Emergency Services</button>
                            </div>
                        </>
                    )}

                    {/** Driver information */}
                    {(userType === 2 && driverRideInfo) && (
                        <>
                            <h1>Ride in Progress</h1>
                            <p><b>Rider Name:</b> {driverRideInfo.First_Name} {driverRideInfo.Last_Name}</p>
                            <p><b>Dropoff Point:</b> {driverRideInfo.Dropoff_Location} </p>
                            {(!arrivalTime) && (<p><b>Estimated Arrival Time:</b></p>)}
                            {(arrivalTime) && (<p><b>Estimated Arrival Time:</b> {arrivalTime} ({estimatedTimeArrival})</p>)}
                            {(estimatedRemainingDistance === undefined) && (<p><b>Distance Remaining:</b></p>)}
                            {(estimatedRemainingDistance > 1 || estimatedRemainingDistance === 0) && (<p><b>Distance Remaining:</b> {estimatedRemainingDistance} miles</p>)}
                            <div className="ride-in-progress-btns-container">
                                {(0 <= estimatedRemainingDistance && estimatedRemainingDistance <= 1) && (
                                    <button className='btn end-ride-btn' onClick={completeRide}>End Ride</button>
                                )}
                                {(estimatedRemainingDistance >= 1 || estimatedRemainingDistance === undefined) && (
                                    <button className='btn refresh-btn' onClick={calculateETA}>Refresh</button>
                                )}
                                <button className='btn emergency-btn'>Emergency Services</button>
                            </div>
                        </>
                    )}
                </aside>
            </main>
        </PageTitle>
    );
};

export default RideinProgress;