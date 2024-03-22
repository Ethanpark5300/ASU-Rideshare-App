import '../styles/Waiting.css'
import PageTitle from '../components/PageTitle/PageTitle';
import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';

function Waiting() {
    const account = useAppSelector((state) => state.account);
    const [userType, setUserType] = useState<number>();

    const getAccountInformation = useCallback(async () => {
        try {
            const response = await fetch(`/view-account-info?accountEmail=${account?.account?.email}`);
            const data = await response.json();

            if (data.account) {
                setUserType(data.account.Type_User);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [account?.account?.email]);

    useEffect(() => {
        getAccountInformation();
    }, [getAccountInformation]);

    return (
        <PageTitle title="Waiting">
            <main id="waiting">
                {/** @TODO Add cancellation timer component here */}

                <h1>Waiting</h1>

                {/** @returns riders waiting page */}
                {(userType === 1) && (
                    <>
                        
                    </>
                )}

                {/** @returns drivers waiting page */}
                {(userType === 2) && (
                    <>
                        
                    </>
                )}
            </main>
        </PageTitle>
    );
}

export default Waiting;