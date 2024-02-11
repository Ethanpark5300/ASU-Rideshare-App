import "../styles/ChooseDriver.css";
import PageTitle from "../components/PageTitle/PageTitle";
import { useState, useEffect, useCallback } from "react";
import MapContainer from "../components/GoogleMaps/MapContainer";
interface ChooseDriverProps {
    email: string;
}

const ChooseDriver: React.FC<ChooseDriverProps> = (props) => {
    const [driversAvailableList, setDriversAvailableList] = useState<any[]>([]);
    const [favoriteDriversAvailableList, setFavoriteDriversAvailableList] = useState<any[]>([]);

    const refreshDriversList = useCallback(async () => {
        try {
            const response = await fetch(`/available-drivers?riderEmail=${props.email}`);
            const data = await response.json();
            setFavoriteDriversAvailableList(data.availableFavoriteDrivers);
            setDriversAvailableList(data.otherAvailableDrivers);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [props.email]);

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
                                <div key={driver.email}>
                                    <p>{driver.first_name} {driver.last_name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>No favorite drivers available.</div>
                    )}

                    <br />

                    {/* List of available drivers excluding riders blocked drivers */}
                    <h2>Available Drivers</h2>
                    {driversAvailableList.length > 0 ? (
                        <div>
                            {driversAvailableList.map((drivers) => (
                                <div key={drivers.Email}>
                                    <p>{drivers.First_Name} {drivers.Last_Name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>No drivers available.</div>
                    )}

                    <div className="choose-btns-container">
                        {/* Refresh Button */}
                        <button className="refresh-btn" onClick={refreshDriversList}>
                            Refresh List
                        </button>

                        {/** @TODO Should request nearest driver */}
                        <button className="nearest-btn" onClick={refreshDriversList}>
                            Request Nearest Driver
                        </button>
                    </div>
                </aside>
                <MapContainer />
            </main>
        </PageTitle>
    );
};

export default ChooseDriver;