import "../styles/Report.css";
import PageTitle from "../components/PageTitle/PageTitle";
import React, { useState } from "react";
import { useAppSelector } from "../store/hooks";

const Report: React.FC = (props) => {
    const account = useAppSelector((state) => state.account);

    //state to store selected reason
    const [selectedReason, setSelectedReason] = useState<string>("");

    //state to store selected comment
    const [comments, setComments] = useState<string>("");

    /** @TODO Replace value with reportee name */
    const reportedUser = "FirstName LastName";

    //function to handle change in dropdown selection
    const handleReasonChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSelectedReason(event.target.value);
    };

    // Function to handle changes in the comments textarea
    const handleCommentsChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setComments(event.target.value);
    };

    // Function to handle submitting the report
    const handleSubmitReport = async () => {
        try {
            fetch(`/send-report`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    reporter: account?.account?.email,
                    reportee: reportedUser,
                    reason: selectedReason,
                    comments: comments,
                }),
            })
        }
        catch (e: any) {
            console.log(e);
        }
    };

    return (
        <PageTitle title="Report User">
            <main id="report">
                <h1> Report User</h1>
                <div className="reportContainer">
                    <h2>You are reporting: {reportedUser}</h2>

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
                        <option value="inappropriate_behavior">Inappropriate Behavior</option>
                        <option value="harassment">Harassment</option>
                        <option value="unsafe_driving">Unsafe Driving</option>
                        {/* Add more options as needed */}
                    </select>

                    {/* Text area for extra comments */}
                    <label htmlFor="comments">Extra Comments:</label>
                    <textarea
                        id="comments"
                        name="comments"
                        rows={4} // You can adjust the number of rows as needed
                        onChange={handleCommentsChange}
                        value={comments}
                    />

                    <button className="reportButton" onClick={handleSubmitReport}>
                        Submit Report
                    </button>
                </div>
            </main>
        </PageTitle>
    );
}

export default Report;
