import "../styles/Report.css";
import PageTitle from "../components/Page_Title/PageTitle";
import React, { useState } from "react";

function Report() {
  //state to store selected reason
  const [selectedReason, setSelectedReason] = useState("");

  //function to handle change in dropdown selection
  const handleReasonChange = (event) => {
    setSelectedReason(event.target.value);
  };

  // Function to handle submitting the report
  const handleSubmitReport = () => {
    // Here, you can save the selectedReason to your database or take any other action
    console.log("Selected Reason:", selectedReason);
  };

  return (
    <PageTitle title="Report User">
      <main id="report">
        <h1> Report User</h1>
        <div className="reportContainer">
          {/* Dropdown menu */}
          <label className="reportLabel" htmlFor="reason">
            Select a reason for reporting:
          </label>
          <select
            id="reason"
            name="reason"
            className="reportSelect"
            onChange={handleReasonChange}
            value={selectedReason}
          >
            <option value="">-----</option>
            <option value="inappropriate_behavior">
              Inappropriate Behavior
            </option>
            <option value="harassment">Harassment</option>
            <option value="unsafe_driving">Unsafe Driving</option>
            {/* Add more options as needed */}
          </select>

          <button className="reportButton" onClick={handleSubmitReport}>
            Submit Report{" "}
          </button>
        </div>
      </main>
    </PageTitle>
  );
}

export default Report;
