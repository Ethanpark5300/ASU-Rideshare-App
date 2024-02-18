import { useCallback, useEffect, useRef, useState } from "react";
import { Account } from "../account/Account";
import "../styles/Login.css";
import { useAppDispatch } from "../store/hooks";
import { setAccountStore } from "../store/features/accountSlice";
import { TextInput } from "../components/TextInput/TextInput";
// import { DatabaseAccessor } from "../databases/DatabaseAccessor";
import { Link } from "react-router-dom";
import { Button } from "../components/Buttons/Button";
import PageTitle from "../components/PageTitle/PageTitle";

//maybe do axios stuff here

function Login() {
    // let databaseAccessor: DatabaseAccessor = DatabaseAccessor.getInstance();
    const dispatch = useAppDispatch();

    const emailRef = useRef<string>("");
    const passwordRef = useRef<string>("");

    const [loginFailed, setLoginFailed] = useState<boolean>(false);
    const [loginMessage, setLoginMessage] = useState<string>();

    const loginRequest = async () => {
        try {
            fetch(`/login`, {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({
                    email: emailRef.current,
                    password: passwordRef.current,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setLoginMessage(data.message);
                    setLoginFailed(!data.loginSuccess);
                    if (data.loginSuccess) {
                        dispatch(setAccountStore(new Account(data.account.Email, data.account.FirstName, data.account.LastName, data.account.PhoneNumber, data.account.AccountType, data.account.PayPalEmail)));
                    } else {
                        dispatch(setAccountStore(undefined));
                    }
                });
        } catch (e: any) {
            console.log(e);
        }
    };

    return (
        <PageTitle title="Login">
            <main id="login">
                <h1>Log In to Rideshare</h1>
                <div className="login-container">
                    <div className="loginLabelContainer">
                        <h2 className="loginLabel">Email:</h2>
                    </div>
                    <div>
                        <TextInput
                            placeholder="Email"
                            regex={/^[a-zA-Z0-9_@.]+$/}
                            valueRef={emailRef}
                            enterFunction={loginRequest}
                        />
                    </div>
                    <div className="loginLabelContainer">
                        <h2 className="loginLabel">Password:</h2>
                    </div>
                    <div>
                        <TextInput
                            placeholder="Password"
                            regex={undefined}
                            valueRef={passwordRef}
                            enterFunction={loginRequest}
                            inputType="password"
                        />
                    </div>

                    {/*loginFailed && (
                        <p className="LoginError">email or password is incorrect</p>
                    )*/}
                    <Button label="Login" onClickFn={loginRequest} />
                    {loginMessage && <p className="RegisterError">{loginMessage}</p>}
                    {loginFailed && <p className="RegisterError">Login failed!</p>}
                    
                    <div className="reglinkContainer">
                        <h3>Don't have an account?</h3>
                        <h3>
                            {" "}
                            <Link to="/Register"> Register </Link>{" "}
                        </h3>
                    </div>
                </div>
            </main>
        </PageTitle>
    );
}

export default Login;
