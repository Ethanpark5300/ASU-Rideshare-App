import '../styles/EditAccount.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useState, useEffect, SetStateAction } from 'react';

function EditAccount() {
    const account = useAppSelector((state) => state.account);
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState<string>();
    const [lastName, setLastName] = useState<string>();
    const [userType, setUserType] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState<string>();

    useEffect(() => {
        if (account && account.account) {
            setFirstName(account.account.firstName);
            setLastName(account.account.lastName);
            setUserType(account.account.accountType);
            setPhoneNumber(account.account.phoneNumber);
        }
    }, [account]);

    useEffect(() => {
        async function getAccountInformation() {
            try {
                const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
                const data = await response.json();

                if (data.account) {
                    setFirstName(data.account.First_Name);
                    setLastName(data.account.Last_Name);
                    setUserType(data.account.Type_User);
                    setPhoneNumber(data.account.Phone_Number);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        getAccountInformation();
    }, [account?.account?.email]);

    const handleFirstNameChange = (e: { target: { value: SetStateAction<string>; }; }) => { setFirstName(e.target.value); };
    const handleLastNameChange = (e: { target: { value: SetStateAction<string>; }; }) => { setLastName(e.target.value); };
    const handleUserTypeChange = (e: { target: { value: SetStateAction<any>; }; }) => { setUserType(e.target.value); };
    const handlePhoneNumberChange = (e: { target: { value: SetStateAction<string>; }; }) => { setPhoneNumber(e.target.value); };

    const handleSaveChanges = () => {
        try {
            fetch(`/edit-account`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userEmail: account?.account?.email,
                    newFirstName: firstName,
                    newLastName: lastName,
                    newAccountType: userType,
                    newPhoneNumber: phoneNumber
                })
            })
            alert('Changes saved!');
        } catch (error) {
            console.log("Error changing account details:", error);
        }
    };

    return (
        <PageTitle title="Edit Account">
            <main id="edit-account">
                <h1>Edit Account</h1>
                <div className="editAccountProfileButton">
                    <button onClick={() => navigate("/Profile")}>Back to Profile Page</button>
                </div>
                <br/>
                <p>
                    * Replace text in text boxes with desired information and click save changes.
                </p>
                <br/>
                <label htmlFor="firstName">First Name</label>
                <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={firstName || ''}
                    onChange={handleFirstNameChange}
                />
                <label htmlFor="lastName">Last Name</label>
                <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={lastName || ''}
                    onChange={handleLastNameChange}
                />
                <label htmlFor="userType">User Type</label>
                <select
                    name="userType"
                    id="userType"
                    value={userType || ''}
                    onChange={handleUserTypeChange}
                >
                    <option value="1">Rider</option>
                    <option value="2">Driver</option>
                </select>
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                    type="text"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={phoneNumber || ''}
                    onChange={handlePhoneNumberChange}
                />
                <br/>
                <br/>
                <button onClick={handleSaveChanges}>Save Changes</button>
            </main>
        </PageTitle>
    );
}

export default EditAccount;