import "../styles/ChooseDriver.css";
import PageTitle from "../components/PageTitle/PageTitle";
import { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  Autocomplete,
} from "@react-google-maps/api";

interface ChooseDriverProps {
  email: string;
}

const ChooseDriver: React.FC<ChooseDriverProps> = (props) => {
  const [driversAvailableList, setDriversAvailableList] = useState<any[]>([]);
  const [favoriteDriversAvailableList, setFavoriteDriversAvailableList] =
    useState<any[]>([]);

  useEffect(() => {
    refreshDriversList();
  }, []);

  const refreshDriversList = async () => {
    try {
      const response = await fetch(
        `/available-drivers?riderEmail=${props.email}`
      );
      const data = await response.json();
      setFavoriteDriversAvailableList(data.availableFavoriteDrivers);
      setDriversAvailableList(data.availableDriversList);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <PageTitle title="Choose Driver">
      <main id="choose-driver">
        <aside className="choosedriver-panel">
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
          <div className="choose-btns-container">
            {/* Refresh Button */}
            <button className="refresh-btn" onClick={refreshDriversList}>
              Refresh List
            </button>

            <button className="nearest-btn" onClick={refreshDriversList}>
              Request Nearest Driver
            </button>
          </div>
        </aside>

        <div className="maps-container"></div>
      </main>
    </PageTitle>
  );
};

export default ChooseDriver;
