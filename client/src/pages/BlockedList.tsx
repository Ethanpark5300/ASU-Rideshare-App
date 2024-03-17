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

    const unblockUser = async (selectedUser: { First_Name: string; Last_Name: string; }) => {
        try {
            await fetch(`/unblock-user`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userid: account?.account?.email,
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
                <header> 
                    <h1>Blocked List</h1>
                </header>
                
                {blockedList.length > 0 ? (
                    <div>
                        {blockedList.map((blockee) => (
                            <div key={blockee.Blocked_ID}>
                                <p>{blockee.First_Name} {blockee.Last_Name} {blockee.Date} <button onClick={() => unblockUser(blockee)}>Remove</button></p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>No blocked list available.</div>
                )}
                
                <div className = "blocked-list-btns-container">
                    <button className="blocked-list-refresh-btn" onClick={getBlockedList}>Refresh</button>
                </div>
            </main>
        </PageTitle>
    );
}

export default BlockedList;