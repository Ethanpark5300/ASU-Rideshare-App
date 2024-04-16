import '../styles/EditPayment.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useAppSelector } from '../store/hooks';
import { SetStateAction, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function EditPayment() {
    const account = useAppSelector((state) => state.account);
    const navigate = useNavigate();
    const [paypalEmail, setPaypalEmail] = useState<string>();

    useEffect(() => {
        if (account && account.account) setPaypalEmail(account.account.paypalEmail);
    }, [account]);

    useEffect(() => {
        async function getPaymentInformation() {
            try {
                const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
                const data = await response.json();
                if (data.account) setPaypalEmail(data.account.Pay_Pal);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        getPaymentInformation();
    }, [account?.account?.email]);

    const handlePaypalEmailChange = (e: { target: { value: SetStateAction<string>; }; }) => { setPaypalEmail(e.target.value); };

    const handleSaveChanges = () => {
        try {
            fetch(`/edit-payment-information`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userEmail: account?.account?.email,
                    newPaypalEmail: paypalEmail
                })
            });
            alert('Changes saved!');
        } catch (error) {
            console.error("Error changing PayPal account:", error);
        }
    };

    return (
        <PageTitle title="Edit Payment">
            <main id="edit-payment">
                <h1>Edit Payment</h1>
                <div className="backProfileButton">
                    <button onClick={() => navigate("/Profile")}>Back to Profile Page</button>
                </div>
                <br />
                <br />
                <div className="infobox">
                    <label htmlFor="payPalEmail">Change PayPal Email to:</label>
                    <input
                        type="text"
                        name="payPalEmail"
                        id="payPalEmail"
                        value={paypalEmail || ''}
                        onChange={handlePaypalEmailChange}
                    />
                </div>
                <br />
                <br />
                <div className="editchangesbutton">
                    <button onClick={handleSaveChanges}>Save Changes</button>
                </div>
            </main>
        </PageTitle>
    );
}

export default EditPayment;