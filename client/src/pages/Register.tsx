import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navigation_Bars/Guest_Navbar/Navbar';
import { TextInput } from '../components/Text_Input/TextInput';
import { DatabaseAccessor } from '../databases/DatabaseAccessor';
import '../styles/Register.css';
import { Button } from '../components/Buttons/Button';
import PageTitle from '../components/Page_Title/PageTitle';

function Register() {
	let databaseAccessor: DatabaseAccessor = DatabaseAccessor.getInstance();
	const emailRef = useRef<string>("");
	const firstNameRef = useRef<string>("");
	const lastNameRef = useRef<string>("");
	const passwordRef = useRef<string>("");
	const password2Ref = useRef<string>("");

	const [registerFailed, setRegisterFailed] = useState<boolean>(false);
	const [passwordMatchFail, setPasswordMatchFail] = useState<boolean>(false);

	const [isSending, setIsSending] = useState(false)
	//object i dont know what props it has
	const [registerMessage, setRegisterMessage] = useState<string|undefined>();


	const registerRequest = useCallback(async () => {
		console.log("register request");

		//basic checks
		/**@todo do more checks*/
		if (passwordRef.current !== password2Ref.current) {
			setPasswordMatchFail(true);
			setRegisterFailed(true);
			return;
		} else {
			setPasswordMatchFail(false);
		}


		// don't send again while we are sending
		if (isSending) return
		// update state
		setIsSending(true)


		console.log("fetched");

		fetch(`/registration`, {
			method: "POST",
			headers: { 'Content-type': "application/json" },
			body: JSON.stringify({
				email: emailRef.current,
				firstName: firstNameRef.current,
				lastName: lastNameRef.current,
				password: passwordRef.current
			})
		})
			.then((res) => res.json())
			.then((data) => { setRegisterMessage(data.message); setRegisterFailed(data.registrationFailed) });
		setIsSending(false)

	}, [isSending]);

	function registerAccount() {

		if (passwordRef.current !== password2Ref.current) {
			setPasswordMatchFail(true);
			setRegisterFailed(true);
			return;
		} else {
			setPasswordMatchFail(false);
		}

		let registerSuccess: boolean = databaseAccessor.register(emailRef.current, firstNameRef.current, lastNameRef.current, passwordRef.current);
		if (registerSuccess) {
			setRegisterFailed(false);
		} else {
			setRegisterFailed(true);
		}
	}
    return (
		<PageTitle title="Register">
			<Navbar />
			<div className='Register'>
				<h1>Register</h1>
				<h2>Email:</h2>
				<div>
					<TextInput
						placeholder=""
						regex={/^[a-zA-Z0-9_@.]+$/}
						valueRef={emailRef}
						enterFunction={registerAccount}
					/>
				</div>

				<h2>First Name:</h2>
				<div>
					<TextInput
						placeholder=""
						regex={undefined}
						valueRef={firstNameRef}
						enterFunction={registerAccount}
					/>
				</div>

				<h2>Last Name:</h2>
				<div>
					<TextInput
						placeholder=""
						regex={undefined}
						valueRef={lastNameRef}
						enterFunction={registerAccount}
					/>
				</div>

				<h2>Password:</h2>
				<div>
					<TextInput
						placeholder=""
						regex={undefined}
						valueRef={passwordRef}
						enterFunction={registerAccount}
						inputType="password"
					/>
				</div>
				<h2>Confirm Password:</h2>
				<div>
					<TextInput
						placeholder=""
						regex={undefined}
						valueRef={password2Ref}
						enterFunction={registerAccount}
						inputType="password"
					/>
				</div>
				{
					(passwordMatchFail) && (
						<p className="RegisterError">
							Passwords do not match!
						</p>
					)
				}

				<Button
					label="register"
					onClickFn={registerRequest}
				/>

				{
					(registerFailed) && (
						<p className="RegisterError">
							Registration failed!
						</p>
					)
				}
				{
					(registerMessage !== undefined) && (
						<p className="RegisterError">
							{registerMessage}
						</p>
					)
				}
			</div>
		</PageTitle>
    );
}

export default Register;