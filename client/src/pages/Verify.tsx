import { useCallback, useEffect, useRef, useState } from "react";
import { TextInput } from "../components/TextInput/TextInput";
import "../styles/Verify.css";
import { Button } from "../components/Buttons/Button";
import PageTitle from "../components/PageTitle/PageTitle";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAccountStore } from "../store/features/accountSlice";
import { Account } from "../account/Account";

function Verify() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    //get data from redirect
    const { state } = useLocation();
    //if state is null, redirect
    useEffect(() => {
        if (state === null) {
            navigate("/Register");
        }
    }, [state, navigate]); /** @TODO Test if anything breaks */
    //console.log(JSON.stringify(state));
    const verifyEmail = state.email;
    //console.log(verifyEmail);


    const verifyRef = useRef<string>("");

    const [registerFailed, setRegisterFailed] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const [isSending, setIsSending] = useState(false);

    const [registerMessage, setRegisterMessage] = useState<string | undefined>();


    const registerRequest = useCallback(async () => {
        //console.log("register request");
        setErrorMsg(undefined);
        setRegisterFailed(false);
        setRegisterMessage(undefined);
        //basic checks
        if (verifyRef.current === "") {
            setRegisterFailed(true);
            setErrorMsg("ID should be filled out");
            return;
        }

        // don't send again while we are sending
        if (isSending) return;
        // update state
        setIsSending(true);

        //console.log("fetched");

        fetch(`/registration_verification`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                register_ID: verifyRef.current,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setRegisterMessage(data.message);
                setRegisterFailed(!data.registrationSuccess);

                if (data.registrationSuccess) {
                    dispatch(setAccountStore(new Account(data.account.Email, data.account.FirstName, data.account.LastName, data.account.PhoneNumber, data.account.AccountType, data.account.PayPalEmail, data.account.Status)));
                    navigate("/Profile");
                }
            });
        setIsSending(false);
    }, [isSending, dispatch, navigate]); /** @TODO Test if anything breaks */

    const resendRequest = useCallback(async () => {
        // don't send again while we are sending
        if (isSending) return;
        // update state
        setIsSending(true);
        //console.log(verifyEmail);
        fetch(`/resend_verification`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                email: verifyEmail,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
            });
        setIsSending(false);
    }, [isSending, verifyEmail]); /** @TODO Test if anything breaks */
    /**@todo highlight which inputs errored*/
    return (
        <PageTitle title="Verify">
            <main id="verify">
                <h1>Join the Rideshare Community</h1>
                <div>
                    <h2>Verification ID</h2>
                    <TextInput
                        placeholder=""
                        regex={/^[a-zA-Z0-9_@.]+$/}
                        valueRef={verifyRef}
                        enterFunction={registerRequest}
                    />
                </div>
                <Button label="Verify" onClickFn={registerRequest} />
                <Button label={"Resend Email (" + verifyEmail + ")"} onClickFn={resendRequest} />
                {errorMsg && <p className="RegisterError">{errorMsg}</p>}
                {registerMessage && (
                    <p className="RegisterError">{registerMessage}</p>
                )}
                {registerFailed && (
                    <p className="RegisterError">Registration failed!</p>
                )}
            </main>
        </PageTitle>
    );
}

export default Verify;
