import '../styles/EditPayment.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useAppSelector } from '../store/hooks';
import { SetStateAction, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function EditPayment() {
    const account = useAppSelector((state) => state.account);

    const [loading, setLoading] = useState(true);
    const [paypalEmail, setPaypalEmail] = useState('');

    useEffect(() => {
        if (account && account.account) {
            setLoading(false);
            setPaypalEmail(account.account.paypalEmail);
        }
    }, [account]);

    const getPaymentInformation = useCallback(async () => {
        try {
            const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
            const data = await response.json();

            if (data.account) {
                setPaypalEmail(data.account.Pay_Pal);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        getPaymentInformation();
    }, [getPaymentInformation]);

    if (loading) { return <div>Loading...</div>; }

    const handlePaypalEmailChange = (e: { target: { value: SetStateAction<string>; }; }) => { setPaypalEmail(e.target.value); };

    const handleSaveChanges = () => {
        try {
            fetch(`/edit-payment-information`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userEmail: account?.account?.email,
                    newPaypalEmail: paypalEmail
                }),
            });
            alert('Changes saved!');
        }
        catch (e: any) {
            console.log(e);
        }
    };

    return (
        <PageTitle title="Edit Payment">
            <main id="edit-payment">
                <h1>Edit Payment</h1>
                <label htmlFor="payPalEmail">PayPal Email</label>
                <input
                    type="text"
                    name="payPalEmail"
                    id="payPalEmail"
                    value={paypalEmail || ''}
                    onChange={handlePaypalEmailChange}
                />
                <button onClick={handleSaveChanges}>Save Changes</button>
                <Link to="/Profile">
                    <button>Back to Profile Page</button>
                </Link>
            </main>
            {/* connects to payapl would only be changing email. */}
        </PageTitle>
    );
}

export default EditPayment;