import '../styles/ChangePassword.css'
import PageTitle from '../components/PageTitle/PageTitle';
import { TextInput } from "../components/TextInput/TextInput";
import { Button } from "../components/Buttons/Button";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppSelector } from '../store/hooks';

function ChangePassword() {
    const account = useAppSelector((state) => state.account);
    const givenPassword = useRef<string>(""); /** current account password */
    const newPassword = useRef<string>(""); /** new password that user wants to use  */
    const newConfirmPassword = useRef<string>(""); /** confirm password to see if it matches newPassword*/

    const [passwordFailed, setPasswordFailed] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const changePassword = async () => {
        if (givenPassword.current !== newPassword.current) {
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
                }),
            })
        }
        catch (error: any) {
            console.log("Error changing password:", error);
        }
    };

    return (
        <PageTitle title="Change Password">
            <main id="Password">
               <h1>Change Password</h1>
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
                <Button label="Change Password" onClickFn={changePassword} />
                {errorMsg && <p className="PasswordError">{errorMsg}</p>}

                {passwordFailed && (
                    <p className="PasswordError"> Change Password failed!</p>
                )}
            </main>
        </PageTitle>
    );
}

export default ChangePassword;