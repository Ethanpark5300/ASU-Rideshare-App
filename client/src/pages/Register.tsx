import { useRef, useState } from 'react';
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
					onClickFn={registerAccount}
				/>

				{
					(registerFailed) && (
						<p className="RegisterError">
							Registration failed!
						</p>
					)
				}
			</div>
		</PageTitle>
    );
}

export default Register;