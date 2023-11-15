import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../components/Navigation_Bar/Navbar";
import { TextInput } from "../components/Text_Input/TextInput";
import { DatabaseAccessor } from "../databases/DatabaseAccessor";
import "../styles/Register.css";
import { Button } from "../components/Buttons/Button";
import PageTitle from "../components/Page_Title/PageTitle";

function Register() {
    let databaseAccessor: DatabaseAccessor = DatabaseAccessor.getInstance();
    const emailRef = useRef<string>("");
    const firstNameRef = useRef<string>("");
    const lastNameRef = useRef<string>("");
    const passwordRef = useRef<string>("");
    const password2Ref = useRef<string>("");

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
        if (!emailRef.current.endsWith("@asu.edu")) {
            setRegisterFailed(true);
            setErrorMsg("Email is not an ASU email!");
            return;
        }

        if (
            firstNameRef.current === "" ||
            lastNameRef.current === "" ||
            emailRef.current === "" ||
            passwordRef.current === "" ||
            password2Ref.current === ""
        ) {
            setRegisterFailed(true);
            setErrorMsg("All inputs should be filled out.");
            return;
        }

        if (passwordRef.current !== password2Ref.current) {
            setRegisterFailed(true);
            setErrorMsg("Passwords do not match!");
            return;
        }

        // don't send again while we are sending
        if (isSending) return;
        // update state
        setIsSending(true);

        //console.log("fetched");

        fetch(`/registration`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                email: emailRef.current,
                firstName: firstNameRef.current,
                lastName: lastNameRef.current,
                password: passwordRef.current,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setRegisterMessage(data.message);
                setRegisterFailed(!data.registrationSuccess);
            });
        setIsSending(false);
    }, [isSending]);

    /**@todo highlight which inputs errored*/
    return (
        <PageTitle title="Register">
            <Navbar />
            <div className="Register">
                <h1>Join the Rideshare Community</h1>
                <div className="register-container">
                    <h2>Email:</h2>
                    <div>
                        <TextInput
                            placeholder=""
                            regex={/^[a-zA-Z0-9_@.]+$/}
                            valueRef={emailRef}
                            enterFunction={registerRequest}
                        />
                    </div>

                    <h2>First Name:</h2>
                    <div>
                        <TextInput
                            placeholder=""
                            regex={undefined}
                            valueRef={firstNameRef}
                            enterFunction={registerRequest}
                        />
                    </div>

                    <h2>Last Name:</h2>
                    <div>
                        <TextInput
                            placeholder=""
                            regex={undefined}
                            valueRef={lastNameRef}
                            enterFunction={registerRequest}
                        />
                    </div>

                    <h2>Password:</h2>
                    <div>
                        <TextInput
                            placeholder=""
                            regex={undefined}
                            valueRef={passwordRef}
                            enterFunction={registerRequest}
                            inputType="password"
                        />
                    </div>
                    <h2>Confirm Password:</h2>
                    <div>
                        <TextInput
                            placeholder=""
                            regex={undefined}
                            valueRef={password2Ref}
                            enterFunction={registerRequest}
                            inputType="password"
                        />
                    </div>
                    <Button label="Register" onClickFn={registerRequest} />
                    {errorMsg && <p className="RegisterError">{errorMsg}</p>}
                    {registerMessage && (
                        <p className="RegisterError">{registerMessage}</p>
                    )}
                    {registerFailed && (
                        <p className="RegisterError">Registration failed!</p>
                    )}
                </div>
            </div>
        </PageTitle>
    );
}

export default Register;
