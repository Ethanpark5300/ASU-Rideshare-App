import '../styles/EditAccount.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { useState, useEffect, SetStateAction, useCallback } from 'react';

function EditAccount() {
    const account = useAppSelector((state) => state.account);

    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userType, setUserType] = useState(0);
    // const [paypalEmail, setPaypalEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        if (account && account.account) {
            setLoading(false);
            setFirstName(account.account.firstName);
            setLastName(account.account.lastName);
            setUserType(account.account.accountType);
            // setPaypalEmail(account.account.paypalEmail);
            setPhoneNumber(account.account.phoneNumber);
        }
    }, [account]);

    const getAccountInformation = useCallback(async () => {
        try {
            const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
            const data = await response.json();

            if (data.account) {
                setFirstName(data.account.First_Name);
                setLastName(data.account.Last_Name);
                setUserType(data.account.Type_User);
                // setPaypalEmail(data.account.Pay_Pal);
                setPhoneNumber(data.account.Phone_Number);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        getAccountInformation();
    }, [getAccountInformation]);

    if (loading) { return <div>Loading...</div>; }

    const handleFirstNameChange = (e: { target: { value: SetStateAction<string>; }; }) => { setFirstName(e.target.value); };
    const handleLastNameChange = (e: { target: { value: SetStateAction<string>; }; }) => { setLastName(e.target.value); };
    const handleUserTypeChange = (e: { target: { value: SetStateAction<any>; }; }) => { setUserType(e.target.value); };
    const handlePhoneNumberChange = (e: { target: { value: SetStateAction<string>; }; }) => { setPhoneNumber(e.target.value); };
    // const handlePaypalEmailChange = (e: { target: { value: SetStateAction<string>; }; }) => { setPaypalEmail(e.target.value); };

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
                    // newPaypalEmail: paypalEmail,
                    newPhoneNumber: phoneNumber
                }),
            });
            alert('Changes saved!');
        }
        catch (e: any) {
            console.log(e);
        }
    };

    return (
        <PageTitle title="Edit Account">
            <main id="edit-account">
                <h1>Edit Account</h1>
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
                    <option value="3">Both</option>
                </select>
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                    type="text"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={phoneNumber || ''}
                    onChange={handlePhoneNumberChange}
                />
                {/* <label htmlFor="payPalEmail">PayPal Email</label>
                <input
                    type="text"
                    name="payPalEmail"
                    id="payPalEmail"
                    value={paypalEmail || ''}
                    onChange={handlePaypalEmailChange}
                /> */}
                <Link to="/Profile">
                    <button>Back to Profile Page</button>
                </Link>
                <button onClick={handleSaveChanges}>Save Changes</button>
            </main>
        </PageTitle>
    );
}

export default EditAccount;