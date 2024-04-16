import '../styles/ChangePassword.css'
import PageTitle from '../components/PageTitle/PageTitle';
import { TextInput } from "../components/TextInput/TextInput";
import { Button } from "../components/Buttons/Button";
import { useRef, useState } from "react";
import { useAppSelector } from '../store/hooks';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
    const account = useAppSelector((state) => state.account);
    const navigate = useNavigate();
    const givenPassword = useRef<string>(); /** current account password */
    const newPassword = useRef<string>(); /** new password that user wants to use  */
    const newConfirmPassword = useRef<string>(); /** confirm password to see if it matches newPassword*/

    const [passwordFailed, setPasswordFailed] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const changePassword = async () => {
        if (newPassword.current !== newConfirmPassword.current) {
            setPasswordFailed(true);
            setErrorMsg("Passwords do not match!");
            return;
        }
        try {
            fetch(`/change-password`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    email: account?.account?.email,
                    givenPassword: givenPassword,
                    newPassword: newPassword,
                })
            })
        } catch (error) {
            console.log("Error changing password:", error);
        }
    };

    return (
        <PageTitle title="Change Password">
            <main id="Password">
               <h1>Change Password</h1>
               <div className="editAccountProfileButton">
                    <button onClick={() => navigate("/Profile")}>Back to Profile Page</button>
                </div>
                <br/>
                <label>Current Password</label>
                <TextInput
                    placeholder=""
                    regex={undefined}
                    valueRef={givenPassword}
                    enterFunction={changePassword}
                /> 
                <label>New Password</label>
                <TextInput
                    placeholder=""
                    regex={undefined}
                    valueRef={newPassword}
                    enterFunction={changePassword}
                /> 
                <label>Confirm New Password</label>
                <TextInput
                    placeholder=""
                    regex={undefined}
                    valueRef={newConfirmPassword}
                    enterFunction={changePassword}
                /> 
                <br/>
                <br/>
                <Button label="Change Password" onClickFn={changePassword} />
                <br/>
                <br/>
                {errorMsg && <p className="PasswordError">{errorMsg}</p>}

                {passwordFailed && (
                    <p className="PasswordError">Change Password failed!</p>
                )}
            </main>
        </PageTitle>
    );
}

export default ChangePassword;