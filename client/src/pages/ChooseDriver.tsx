import "../styles/ChooseDriver.css";
import PageTitle from "../components/PageTitle/PageTitle";
import { useState, useEffect, useCallback } from "react";
import LiveTracking from "../components/GoogleMaps/LiveTracking";
import { useAppSelector } from "../store/hooks";
import { useNavigate } from "react-router-dom";

const ChooseDriver: React.FC = () => {
    const account = useAppSelector((state) => state.account);
    const [driversAvailableList, setDriversAvailableList] = useState<any[]>([]);
    const [favoriteDriversAvailableList, setFavoriteDriversAvailableList] = useState<any[]>([]);
    const [requestedDrivers, setRequestedDrivers] = useState<any[]>([]);
    const [driverAccepted, setDriverAccepted] = useState<string>();
    const navigate = useNavigate();

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

    const requestDriver = async (selectedDriver: { Email: string; }) => {
        try {
            await fetch(`/request-driver`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    riderid: account?.account?.email,
                    driverid: selectedDriver?.Email
                }),
            });
            setRequestedDrivers((prevDrivers) => [...prevDrivers, selectedDriver]);
            refreshDriversList();
        } catch (error) {
            console.error("Error requesting driver:", error);
        }
    };

    const cancelRequestDriver = async (selectedDriver: { Email: string; }) => {
        try {
            await fetch(`/cancel-request-driver`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    riderid: account?.account?.email,
                    driverid: selectedDriver?.Email
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
            navigate("/Payment");
        } catch (error) {
            console.error("Error cancelling ride request:", error);
        }
    }, [account?.account?.email, navigate]);

    const checkRideStatus = useCallback(async () => {
        try {
            const response = await fetch(`/check-driver-accepted-status?riderid=${account?.account?.email}`);
            const data = await response.json();
            setDriverAccepted(data.recievedDriver);

            if (driverAccepted !== "PAYMENT") return;
            navigate("/Payment");
        } catch (error) {
            console.error("Error checking ride status:", error);
        }
    }, [account?.account?.email, navigate, driverAccepted]);

    useEffect(() => {
        const interval = setInterval(() => {
            checkRideStatus();
        }, 1000);
        return () => clearInterval(interval);
    }, [checkRideStatus]);

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
                            <p className="none-error">No favorite drivers are available.</p>
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
                            <p className="none-error">No drivers are available.</p>
                        )}
                    </section>

                    <section className="choose-driver-btns-container">
                        <button className="btn check-status-btn" onClick={checkRideStatus}>Check Status</button>
                        <button className="btn refresh-list-btn" onClick={refreshDriversList}>Refresh</button>
                        <button className="btn cancel-ride-btn" onClick={cancelRideRequest}>Cancel</button>
                    </section>
                </aside>
                <LiveTracking />
            </main>
        </PageTitle>
    );
};

export default ChooseDriver;