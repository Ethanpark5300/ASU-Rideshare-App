import "../styles/ChooseDriver.css";
import PageTitle from "../components/PageTitle/PageTitle";
import { useState, useEffect, useCallback } from "react";
import LiveTracking from "../components/GoogleMaps/LiveTracking";
import { useAppSelector } from "../store/hooks";

const ChooseDriver: React.FC = (props) => {
    const account = useAppSelector((state) => state.account);
    const [driversAvailableList, setDriversAvailableList] = useState<any[]>([]);
    const [favoriteDriversAvailableList, setFavoriteDriversAvailableList] = useState<any[]>([]);

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

    useEffect(() => {
        refreshDriversList();
    }, [refreshDriversList]);

    return (
        <PageTitle title="Choose Driver">
            <main id="choose-driver">

                <aside className="choosedriver-panel">
                    <h1>Choose a Driver</h1>

                    {/* List of available riders favorite drivers */}
                    <h2>Available Favorite Drivers</h2>
                    {favoriteDriversAvailableList.length > 0 ? (
                        <div>
                            {favoriteDriversAvailableList.map((driver) => (
                                <div key={driver.Email}>
                                    {/** @TODO Request specific driver */}
                                    <p>{driver.First_Name} {driver.Last_Name}<button className="request-btn">Request</button></p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>No favorite drivers are available.</div>
                    )}

                    <br />

                    {/* List of available drivers excluding riders blocked drivers */}
                    <h2>Available Drivers</h2>
                    {driversAvailableList.length > 0 ? (
                        <div>
                            {driversAvailableList.map((drivers) => (
                                <div key={drivers.Email}>
                                    {/** @TODO Request specific driver */}
                                    <p>{drivers.First_Name} {drivers.Last_Name} <button className="request-btn">Request</button></p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>No drivers are available.</div>
                    )}

                    <div className="choose-btns-container">
                        {/* Refresh Button */}
                        <button className="refresh-btn" onClick={refreshDriversList}>
                            Refresh List
                        </button>

                        <button className="cancel-btn">
                            Cancel
                        </button>

                        {/** @TODO Should request nearest driver */}
                        {/* <button className="nearest-btn" onClick={refreshDriversList}>
                            Request Nearest Driver
                        </button> */}
                    </div>
                </aside>
            <LiveTracking/>
            </main>
        </PageTitle>
    );
};

export default ChooseDriver;