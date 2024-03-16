import "../styles/ChooseDriver.css";
import PageTitle from "../components/PageTitle/PageTitle";
import { useState, useEffect, useCallback } from "react";
import LiveTracking from "../components/GoogleMaps/LiveTracking";
import { useAppSelector } from "../store/hooks";
import { Link } from "react-router-dom";

const ChooseDriver: React.FC = () => {
    const account = useAppSelector((state) => state.account);
    const [driversAvailableList, setDriversAvailableList] = useState<any[]>([]);
    const [favoriteDriversAvailableList, setFavoriteDriversAvailableList] = useState<any[]>([]);
    const [requestedDrivers, setRequestedDrivers] = useState<any[]>([]);

    const refreshDriversList = useCallback(async () => {
        try {
            const response = await fetch(`/available-drivers?riderid=${account?.account?.email}`);
            const data = await response.json();
            setFavoriteDriversAvailableList(data.availableFavoriteDrivers);
            setDriversAvailableList(data.otherAvailableDrivers);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    const requestDriver = async (driver: any) => {
        try {
            await fetch(`/request-driver`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    rider: account?.account?.email,
                    selectedDriverFirstName: driver.First_Name,
                    selectedDriverLastName: driver.Last_Name
                }),
            });
            setRequestedDrivers((prevDrivers) => [...prevDrivers, driver]);
            refreshDriversList();
        } catch (error) {
            console.error("Error requesting driver:", error);
        }
    };

    const cancelRequestDriver = async (selectedDriver: any) => {
        try {
            await fetch(`/cancel-request-driver`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    rider: account?.account?.email,
                    selectedDriverFirstName: selectedDriver?.First_Name,
                    selectedDriverLastName: selectedDriver?.Last_Name
                }),
            });
            setRequestedDrivers((prevDrivers) => prevDrivers.filter((driver) => driver.Email !== selectedDriver?.Email));
            refreshDriversList();
        } catch (error) {
            console.error("Error canceling request:", error);
        }
    };

    const cancelRideRequest = useCallback(async () => {
        try {
            await fetch(`/cancel-request?riderid=${account?.account?.email}`);
        } catch (error) {
            console.error("Error canceling ride request:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        refreshDriversList();
    }, [refreshDriversList]);

    return (
        <PageTitle title="Choose Driver">
            <main id="choose-driver">
                <aside className="choosedriver-panel">
                    <header>
                        <h1>Choose Driver</h1>
                    </header>

                    {/* List of available riders favorite drivers */}
                    <section id="available-favorite-drivers-container">
                        <h2>Available Favorite Drivers</h2>
                        {favoriteDriversAvailableList.length > 0 ? (
                            <div>
                                {favoriteDriversAvailableList.map((driver) => (
                                    <div className="driver-item" key={driver.Email}>
                                        <p>{driver.First_Name} {driver.Last_Name}</p>
                                        {requestedDrivers.some((reqDriver) => reqDriver.Email === driver.Email) ? (
                                            <button onClick={() => cancelRequestDriver(driver)} className="cancel-driver-request-btn">
                                                Cancel Request
                                            </button>
                                        ) : (
                                            <button onClick={() => requestDriver(driver)} className="request-driver-btn">
                                                Request Driver
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No favorite drivers are available.</p>
                        )}
                    </section>

                    {/* List of available drivers excluding riders blocked drivers */}
                    <section id="other-available-drivers-container">
                        <h2>Available Drivers</h2>
                        {driversAvailableList.length > 0 ? (
                            <div>
                                {driversAvailableList.map((driver) => (
                                    <div className="driver-item" key={driver.Email}>
                                        <p>{driver.First_Name} {driver.Last_Name}</p>
                                        {requestedDrivers.some((reqDriver) => reqDriver.Email === driver.Email) ? (
                                            <button onClick={() => cancelRequestDriver(driver)} className="cancel-driver-request-btn">
                                                Cancel Request
                                            </button>
                                        ) : (
                                            <button onClick={() => requestDriver(driver)} className="request-driver-btn">
                                                Request Driver
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No drivers are available.</p>
                        )}
                    </section>

                    <section className="choose-btns-container">
                        {/* Refresh Button */}
                        <button className="refresh-list-btn" onClick={refreshDriversList}>Refresh</button>

                        {/* Cancel Button */}
                        <Link to="/" className="center-horizontal">
                            <button className="cancel-ride-btn" onClick={cancelRideRequest}>Cancel</button>
                        </Link>
                    </section>
                </aside>
                <LiveTracking />
            </main>
        </PageTitle>
    );
};

export default ChooseDriver;