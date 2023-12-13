import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import "./PayPal.css"

interface PayPalProps {
    driverEmail: string;
    cost: number;
}

const PayPal: React.FC<PayPalProps> = ({ driverEmail, cost }) => {
    const [error, setError] = useState<string | null>(null);

    const createOrder = (data: any, actions: any) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: cost,
                    },
                },
            ],
            payer: {
                email_address: driverEmail,
            },
        });
    };

    const onApprove = (data: any, actions: any) => {
        // Capture the funds and complete the transaction
        return actions.order.capture()

            // Payment was successful
            .then((details: any) => {
                console.log('Payment captured:', details);

                /** @TODO Perfom additional actions */
            })

            // Display errors during the capture process
            .catch((err: any) => {
                console.error('Capture error:', err);
            });
    };

    const onError = (err: any) => {
        console.error('PayPal SDK Error:', err);
        setError('An error occurred while processing your payment. Please try again later.');
        /** @TODO Take additional actions here, such as showing a user-friendly error message or logging the error */
    };

    return (
        <PayPalScriptProvider
            options={{
                clientId: 'AZ9VS710-C_5VvkPJxpLYMnkrGW3qmkFU80opkWfPF4ahh9d6Xitx8rRdyLRaaAaXyMZjNWj5Ouv5eQ1',
            }}
        >
            <div>
                <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    /** @TODO Button styles https://developer.paypal.com/docs/multiparty/checkout/standard/customize/buttons-style-guide/ */
                    style={{}}
                />
            </div>
        </PayPalScriptProvider>
    );
};

export default PayPal;
