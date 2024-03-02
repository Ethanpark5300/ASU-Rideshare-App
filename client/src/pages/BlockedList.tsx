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
            setBlockedList(data.blockedList);
        } catch (error) {
            console.error("Error getting blocked list:", error);
        }
    }, [account?.account?.email]);

    const removedBlockedUser = async (selectedUser: { First_Name: string; Last_Name: string; }) => {
        try {
            await fetch(`/unblock-user`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    user: account?.account?.email,
                    selectedFirstName: selectedUser?.First_Name,
                    selectedLastName: selectedUser?.Last_Name
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setBlockedList(data.blockedList);
                    getBlockedList();
                });
        } catch (error) {
            console.error("Error unblocking request:", error);
        }
    };

    useEffect(() => {
        getBlockedList();
    }, [getBlockedList]);

    return (
        <PageTitle title="Blocked List">
            <main id="blocked-list">
                <h1>Blocked List</h1>
                {blockedList.length > 0 ? (
                    <div>
                        {blockedList.map((blockee) => (
                            <div key={blockee.Blocked_ID}>
                                <p>{blockee.First_Name} {blockee.Last_Name} {blockee.Date} <button onClick={() => removedBlockedUser(blockee)}>Remove</button></p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>No blocked list available.</div>
                )}
                <button onClick={getBlockedList}>Refresh</button>
            </main>
        </PageTitle>
    );
}

export default BlockedList;