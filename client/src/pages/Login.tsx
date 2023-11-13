import { useCallback, useEffect, useRef, useState } from "react";
import { Account } from "../account/Account";
import "../styles/Login.css";
import { useAppDispatch } from "../store/hooks";
import { setAccountStore } from "../store/features/accountSlice";
import { TextInput } from "../components/Text_Input/TextInput";
import Navbar from "../components/Navigation_Bars/Guest_Navbar/Navbar";
import { DatabaseAccessor } from "../databases/DatabaseAccessor";
import { Link } from "react-router-dom";
import { Button } from "../components/Buttons/Button";
import PageTitle from "../components/Page_Title/PageTitle";

//maybe do axios stuff here

function Login() {
	let databaseAccessor: DatabaseAccessor = DatabaseAccessor.getInstance();
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
					password: passwordRef.current
				}),
			})
				.then((res) => res.json())
				.then((data) => {
					setLoginMessage(data.message);
					setLoginFailed(!data.loginSuccess);
					if (data.loginSuccess) {
						dispatch(setAccountStore(new Account(data.account.Email)));
					} else {
						dispatch(setAccountStore(undefined));
					}
				});
		} catch (e: any) {
			console.log(e);
		}


	};

	const readCookie = async () => {
		try {
			fetch(`/read-cookie`, {
				method: "GET",
				headers: { "Content-type": "application/json" },
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.Email !== undefined) {
						dispatch(setAccountStore(new Account(data.Email)));
					} else {
						dispatch(setAccountStore(undefined));
					}
				});
		} catch {

		}
	};

	const eatCookie = async () => {
		try {
			fetch(`/clear-cookie`, {
				method: "GET",
				headers: { "Content-type": "application/json" },
			})
			dispatch(setAccountStore(undefined));
		} catch {

		}
	}

	return (
		<PageTitle title="Login">
			<Navbar />
			<div className="Login">

				<h1>Log In to Rideshare</h1>
				<div className="login-container">
					<h2>Email:</h2>
					<div>
						<TextInput
							placeholder=""
							regex={/^[a-zA-Z0-9_@.]+$/}
							valueRef={emailRef}
							enterFunction={loginRequest}
						/>
					</div>

					<h2>Password:</h2>
					<div>
						<TextInput
							placeholder=""
							regex={undefined}
							valueRef={passwordRef}
							enterFunction={loginRequest}
							inputType="password"
						/>
					</div>

					{loginFailed && (
						<p className="LoginError">email or password is incorrect</p>
					)}
					<Button label="Login" onClickFn={loginRequest} />
					{loginMessage && (
						<p className="RegisterError">{loginMessage}</p>
					)}
					{loginFailed && (
						<p className="RegisterError">Login failed!</p>
					)}
					<Button label="Check Cookie" onClickFn={readCookie} />
					<Button label="Nom Cookie(logout)" onClickFn={eatCookie} />
					<h2>Don't have an account?</h2>
					<h2>
						{" "}
						<Link to="/Register"> Register </Link>{" "}
					</h2>
				</div>
			</div>
		</PageTitle>
	);
}

export default Login;
