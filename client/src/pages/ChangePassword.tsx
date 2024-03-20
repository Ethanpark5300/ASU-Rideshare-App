import '../styles/ChangePassword.css'
import PageTitle from '../components/PageTitle/PageTitle';
import { TextInput } from "../components/TextInput/TextInput";
import { Button } from "../components/Buttons/Button";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppSelector } from '../store/hooks';

function ChangePassword() {
    const account = useAppSelector((state) => state.account);
    const confirmationCode = useRef<string>(""); /**random password that is given */
    const newPassword = useRef<string>(""); /** new password that user wants to use  */
    const newConfirmPassword = useRef<string>(""); /** confirm password to see if it matches newPassword*/

    const changePassword = async () => {
        try {
            fetch(`/change-password`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    userEmail: account?.account?.email,
                    confirmationCode: confirmationCode,
                    newPassword: newPassword,
                    newConfirmPassword: newConfirmPassword,
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
                <label>Confirmation Code</label>
                <TextInput
                    placeholder=""
                    regex={undefined}
                    valueRef={confirmationCode}
                    enterFunction={changePassword}
                /> 
                <label>New Password</label>
                <TextInput
                    placeholder=""
                    regex={undefined}
                    valueRef={newPassword}
                    enterFunction={changePassword}
                /> 
                <label>Confirm Password</label>
                <TextInput
                    placeholder=""
                    regex={undefined}
                    valueRef={newConfirmPassword}
                    enterFunction={changePassword}
                /> 
                <Button label="Change Password" onClickFn={changePassword} />
            </main>
        </PageTitle>
    );
}

export default ChangePassword;