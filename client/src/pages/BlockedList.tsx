import '../styles/BlockedList.css';
import PageTitle from '../components/PageTitle/PageTitle';
import { useAppSelector } from '../store/hooks';
import { useEffect, useState } from 'react';

function BlockedList() {
    const account = useAppSelector((state) => state.account);
    const [blockedList, setBlockedList] = useState<any[]>([]);

    useEffect(() => {
        async function getBlockedList() {
            try {
                const response = await fetch(`/get-blocked-list?userid=${account?.account?.email}`);
                const data = await response.json();
                setBlockedList(data.blockedList);
            } catch (error) {
                console.error("Error getting blocked list:", error);
            }
        }
        getBlockedList();
    }, [account?.account?.email, blockedList]);

    const unblockUser = async (selectedUser: { Blockee_ID: string; }) => {
        try {
            await fetch(`/unblock-user`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userid: account?.account?.email,
                    selectedUser: selectedUser?.Blockee_ID
                })
            });
        } catch (error) {
            console.error("Error unblocking user:", error);
        }
    };

    return (
        <PageTitle title="Blocked List">
            <main id="blocked-list">
                <header><h1>Blocked List</h1></header>
                
                {blockedList.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        {blockedList.map((blockee) => (
                            <tr key={blockee.Blocked_ID}>
                                <td>{blockee.First_Name} {blockee.Last_Name}</td>
                                <td>{blockee.Date}</td>
                                <td><button onClick={() => unblockUser(blockee)} className='unblock-btn'>Unblock</button></td>
                            </tr>
                        ))}
                    </table>
                ) : (
                    <div className = "blocked-list-container">No blocked list available.</div>
                )}
            </main>
        </PageTitle>
    );
}

export default BlockedList;