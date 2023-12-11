import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PayPalComponentProps {
    driverEmail: string;
    cost: number;
}

const PayPalComponent: React.FC<PayPalComponentProps> = ({ driverEmail, cost }) => {
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
        return actions.order.capture();
    };

    const onError = (err: any) => {
        console.error('PayPal SDK Error:', err);
        setError('An error occurred while processing your payment. Please try again later.');
        /**
         * @TODO Take additional actions here, such as showing a user-friendly error message or logging the error
         */
    };

    return (
        <PayPalScriptProvider
            options={{
                'client-id': 'AZ9VS710-C_5VvkPJxpLYMnkrGW3qmkFU80opkWfPF4ahh9d6Xitx8rRdyLRaaAaXyMZjNWj5Ouv5eQ1', // Replace with your PayPal client ID
            }}
        >
            <div>
                <PayPalButtons
                    createOrder={createOrder}
                    onApprove={onApprove}
                    /**
                     * @TODO https://developer.paypal.com/docs/multiparty/checkout/standard/customize/buttons-style-guide/ 
                     */
                    style={{  }}
                />
            </div>
        </PayPalScriptProvider>
    );
};

export default PayPalComponent;
