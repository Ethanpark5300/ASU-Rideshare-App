import { useCallback, useEffect, useRef, useState } from "react";
import { TextInput } from "../components/TextInput/TextInput";
import "../styles/Register.css";
import { Button } from "../components/Buttons/Button";
import PageTitle from "../components/PageTitle/PageTitle";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAccountStore } from "../store/features/accountSlice";
import { Account } from "../account/Account";

function Verify() {
    const verifyRef = useRef<string>("");

    const [registerFailed, setRegisterFailed] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

    const [isSending, setIsSending] = useState(false);

    const [registerMessage, setRegisterMessage] = useState<string | undefined>();

	const navigate = useNavigate();
	const dispatch = useDispatch();
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
					dispatch(setAccountStore(new Account(data.account.Email, data.account.FirstName, data.account.LastName, data.account.PhoneNumber, data.account.AccountType, data.account.PayPalEmail)));
					navigate("/Profile");
				}
            });
        setIsSending(false);
    }, [isSending]);

    /**@todo highlight which inputs errored*/
    return (
        <PageTitle title="Verify">
            <main id="verify">
                <h1>Join the Rideshare Community</h1>
                <div className="register-container">
                    <div className="regfield-container">
                        <h2 className="regfield-text">Verification ID</h2>
                        <div>
                            <TextInput
                                placeholder=""
                                regex={/^[a-zA-Z0-9_@.]+$/}
                                valueRef={verifyRef}
                                enterFunction={registerRequest}
                            />
                        </div>
                    </div>
                    <Button label="Verify" onClickFn={registerRequest} />
                    {errorMsg && <p className="RegisterError">{errorMsg}</p>}
                    {registerMessage && (
                        <p className="RegisterError">{registerMessage}</p>
                    )}
                    {registerFailed && (
                        <p className="RegisterError">Registration failed!</p>
                    )}
                </div>
            </main>
        </PageTitle>
    );
}

export default Verify;
