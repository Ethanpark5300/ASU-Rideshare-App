import "../styles/Report.css";
import PageTitle from "../components/PageTitle/PageTitle";
import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { useNavigate } from "react-router-dom";

function Report() {
    const account = useAppSelector((state) => state.account);
    const navigate = useNavigate();
    const [userType, setUserType] = useState<number>();
    const [riderRatingInformation, setRiderRatingInformation] = useState<any>([]);
    const [driverRatingInformation, setDriverRatingInformation] = useState<any>([]);
    const [selectedReason, setSelectedReason] = useState<string>();
    const [comments, setComments] = useState<string>();

    const getAccountInformation = useCallback(async () => {
        try {
            const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
            const data = await response.json();
            if (data.account) setUserType(data.account.Type_User);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        const delay: number = 500;
        const timerId = setTimeout(() => {
            async function getRatingsInformation() {
                try {
                    const response = await fetch(`/get-ratings-information?userid=${account?.account?.email}`);
                    const data = await response.json();
                    setRiderRatingInformation(data.driverRatingInformation);
                    setDriverRatingInformation(data.riderRatingInformation);
                } catch (error) {
                    console.error("Error retrieving ratings information:", error);
                }
            };
            getRatingsInformation();
        }, delay);
        return () => clearTimeout(timerId);
    }, [account?.account?.email]);

    //function to handle change in dropdown selection
    const handleReasonChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setSelectedReason(event.target.value);
    };

    // Function to handle changes in the comments textarea
    const handleCommentsChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setComments(event.target.value);
    };

    // Function to handle submitting the driver report
    const handleSubmitDriverReport = async () => {
        try {
            fetch(`/report-user`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    reporterID: account?.account?.email,
                    reporteeID: riderRatingInformation.Driver_ID,
                    reason: selectedReason,
                    comments: comments,
                }),
            })
            alert("Driver has been reported");
        } catch (error: any) {
            console.log("Error sending driver report:", error);
        }
    };

    // Function to handle submitting the rider report
    const handleSubmitRiderReport = async () => {
        try {
            fetch(`/report-user`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    reporterID: account?.account?.email,
                    reporteeID: driverRatingInformation.Rider_ID,
                    reason: selectedReason,
                    comments: comments,
                }),
            })
            alert("Rider has been reported");
        } catch (error: any) {
            console.log("Error sending rider report:", error);
        }
    };

    useEffect(() => {
        getAccountInformation();
    }, [getAccountInformation]);

    return (
        <PageTitle title="Report User">
            <main id="report">
                <h1> Report User</h1>

                {/* Rider report */}
                {(userType === 1) &&(
                    <div className="reportContainer">
                        <h2>You are reporting:</h2>
                        <h2>{riderRatingInformation.First_Name} {riderRatingInformation.Last_Name} </h2>

                        {/* Dropdown menu */}
                        <label className="reportLabel" htmlFor="reason">Select a reason for reporting:</label>
                        <select
                            id="reason"
                            name="reason"
                            className="reportSelect"
                            onChange={handleReasonChange}
                            value={selectedReason}
                        >
                            <option value="">-----</option>
                            <option value="inappropriate_behavior">Inappropriate Behavior</option>
                            <option value="safety_concerns">Safety Concerns</option>
                            <option value="unsafe_driving">Unsafe Driving</option>
                        </select>

                        {/* Text area for extra comments */}
                        <label htmlFor="comments">Extra Comments:</label>
                        <textarea
                            id="comments"
                            name="comments"
                            rows={10}
                            cols={40}
                            onChange={handleCommentsChange}
                            value={comments}
                        />

                        <button className="reportButton" onClick={handleSubmitDriverReport}>Submit Report</button>
                        <button className="back-btn" onClick={() => navigate("/Rating")}>Back</button>
                    </div>
                )}

                {/* Driver report */}
                {(userType === 2) &&(
                    <div className="reportContainer">
                        <h2>You are reporting:</h2>
                        <h2>{driverRatingInformation.First_Name} {driverRatingInformation.Last_Name}</h2>
                        {/* Dropdown menu */}
                        <label className="reportLabel" htmlFor="reason">Select a reason for reporting:</label>
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
                            <option value="fraudulent_activity">Fraudulent Activity</option>
                        </select>

                        {/* Text area for extra comments */}
                        <label htmlFor="comments">Extra Comments:</label>
                        <textarea
                            id="comments"
                            name="comments"
                            rows={10}
                            cols={40}
                            onChange={handleCommentsChange}
                            value={comments}
                        />

                        <button className="reportButton" onClick={handleSubmitRiderReport}>Submit Report</button>
                        <button className="back-btn" onClick={() => navigate("/Rating")}>Back</button>
                    </div>
                )}
            </main>
        </PageTitle>
    );
}

export default Report;
