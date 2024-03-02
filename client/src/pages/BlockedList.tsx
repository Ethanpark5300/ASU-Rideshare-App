import '../styles/BlockedList.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useAppSelector } from '../store/hooks';
import { useCallback, useEffect, useState } from 'react';

function BlockedList() {
    const account = useAppSelector((state) => state.account);
    const [blockedList, setBlockedList] = useState<any[]>([]);

    const getBlockedList = useCallback(async () => {
        try {
            const response = await fetch(`/get-blocked-list?userid=${account?.account?.email}`);
            const data = await response.json();
            setBlockedList(data.blockedList)
        } catch (error) {
            console.error("Error getting blocked list:", error);
        }
    }, [account?.account?.email]);

    

    useEffect(() => {
        getBlockedList();
    }, [getBlockedList]);

    return (
        <PageTitle title="Blocked List">
            <main id="blocked-list">
                <h1>Blocked List</h1>
                {blockedList.length > 0 ? (
                    <div>
                        {blockedList.map((blocked) => (
                            <div key={blocked.Blocked_ID}>
                                <p>{blocked.First_Name} {blocked.Last_Name} {blocked.Date}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>No blocked list available.</div>
                )}
            </main>
        </PageTitle>
    );
}

export default BlockedList;