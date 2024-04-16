import { useState } from 'react';
import buildingsData from './Buildings.json';
import Select from 'react-select';
import './BuildingSearch.css';

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

function BuildingSearch() {
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingOption | null>(null);

    const buildingOptions: BuildingOption[] = buildingsData.buildings.map((building: Building) => ({
        value: building.code,
        label: `${building.code} - ${building.name} (${building.address})`,
        address: building.address,
    }));

    const handleBuildingChange = (selectedOption: BuildingOption | null) => {
        setSelectedBuilding(selectedOption);
    };

    const handleClearSearch = () => {
        setSelectedBuilding(null);
    };

    const customOption = ({ innerProps, label, isFocused }: any) => (
        <div {...innerProps} className={isFocused ? 'option-focused' : 'option'}>
            <div>{label}</div>
        </div>
    );

    return (
        <div className="BuildingSearch">
            <h2>Building Search</h2>
            <Select
                classNamePrefix="search-bar"
                options={buildingOptions}
                value={selectedBuilding}
                onChange={handleBuildingChange}
                isSearchable
                placeholder="Search for a building..."
                components={{ Option: customOption }}
            />
            <button className="ClearButton" onClick={handleClearSearch}>Clear</button>
            {selectedBuilding && (
                <div className="SelectedBuilding">
                    <h3>Selected Building</h3>
                    <p>
                        Code: {selectedBuilding.value} <br />
                        Name: {selectedBuilding.label.split(' - ')[1].split(' (')[0]} <br />
                        Address: {selectedBuilding.address}
                    </p>
                </div>
            )}
        </div>
    );
}

export default BuildingSearch;