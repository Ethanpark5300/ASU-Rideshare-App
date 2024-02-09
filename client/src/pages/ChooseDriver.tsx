import "../styles/ChooseDriver.css";
import PageTitle from "../components/PageTitle/PageTitle";
import { useState, useEffect } from "react";

interface ChooseDriverProps {
    email: string;
}

const ChooseDriver: React.FC<ChooseDriverProps> = (props) => {
    const [driversAvailableList, setDriversAvailableList] = useState<any[]>([]);
    const [favoriteDriversAvailableList, setFavoriteDriversAvailableList] = useState<any[]>([]);

    useEffect(() => {
        refreshDriversList();
    }, []);

    const refreshDriversList = async () => {
        try {
            const response = await fetch(`/available-drivers?riderEmail=${props.email}`);
            const data = await response.json();
            setFavoriteDriversAvailableList(data.availableFavoriteDrivers);
            setDriversAvailableList(data.availableDriversList);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
   
    return (
        <PageTitle title="Choose Driver">
            <main id="choose-driver">
                <h1>Choose a Driver</h1>

                {/* Favorites List of Available Drivers */}
                <h2>All Available Favorite Drivers</h2>
                {favoriteDriversAvailableList.length > 0 ? (
                    <div>
                        {favoriteDriversAvailableList.map((drivers) => (
                            <div key={drivers.Email}>
                                <p>{drivers.First_Name}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>No drivers available.</div>
                )}

                {/* General List of Available Drivers */}
                <h2>All Available Drivers</h2>
                {driversAvailableList.length > 0 ? (
                    <div>
                        {driversAvailableList.map((drivers) => (
                            <div key={drivers.Email}>
                                <p>{drivers.First_Name}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>No drivers available.</div>
                )}

                {/* Refresh Button */}
                <button onClick={refreshDriversList}>Refresh List</button>
            </main>
        </PageTitle>
    );
}

export default ChooseDriver;