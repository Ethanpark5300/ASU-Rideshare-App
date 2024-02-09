import "../styles/ChooseDriver.css";
import PageTitle from "../components/PageTitle/PageTitle";
import { useState, useEffect } from "react";

function ChooseDriver() {
    const [driversAvailableList, setDriversAvailableList] = useState<any[]>([]);
    const [favoriteDriversAvailableList, setFavoriteDriversAvailableList] = useState<any[]>([]);

    const refreshDriversList = async () => {
        /** @TODO Return current user's favorite driver's available list */

        try {
            const response = await fetch(`/available-drivers`);
            const data = await response.json();
            // console.log(data.results);
            setDriversAvailableList(data.driverListResults);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    //Show inital available drivers list to the user
    useEffect(() => {
        refreshDriversList();
    }, []);

    return (
        <PageTitle title="Choose Driver">
            <main id="choose-driver">
                <h1>Choose a Driver</h1>

                {/* Favorites List of Available Drivers */}

                {/* General List of Available Drivers */}
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

                <button type="submit" onClick={refreshDriversList}>Refresh List</button>

            </main>
        </PageTitle>
    );
}

export default ChooseDriver;
