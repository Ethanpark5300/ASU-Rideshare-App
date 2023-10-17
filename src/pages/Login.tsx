import { useRef, useState } from 'react';
import { Account } from '../account/Account';
import '../styles/Login.css';
import '../components/Navigation_Bar/Navbar.css';
import { useAppDispatch } from '../store/hooks';
import { setAccountStore } from '../store/features/accountSlice';
import { TextInput } from '../components/Text_Input/TextInput';
import Navbar from '../components/Navigation_Bar/Navbar';
import { DatabaseAccessor } from '../databases/DatabaseAccessor';
import { NavLink } from 'react-router-dom';
import { Button } from '../components/Buttons/Button';


function Login() {
	let databaseAccessor: DatabaseAccessor = DatabaseAccessor.getInstance();
	const dispatch = useAppDispatch();

	const emailRef = useRef<string>("");
	const passwordRef = useRef<string>("");

	const [loginFailed, setLoginFailed] = useState<boolean>(false);

	function setAccount() {


		let loginAccount: Account | undefined = databaseAccessor.login(emailRef.current, passwordRef.current);
		if (loginAccount !== undefined) {
			//success login
			setLoginFailed(false);
		} else {
			//fail login
			setLoginFailed(true);
		}
		//store account in store, or store undefined if no login made
		dispatch(setAccountStore(loginAccount));
		
	}

    return (
		<div className='Login'>
			<Navbar />
			<h1>Login</h1>
			<h2>Email:</h2>
			<div>
				<TextInput
					placeholder=""
					regex={/^[a-zA-Z0-9_@.]+$/}
					valueRef={emailRef}
					enterFunction={setAccount}
				/>
			</div>
			
			<h2>Password:</h2>
			<div>
				<TextInput
					placeholder=""
					regex={undefined}
					valueRef={passwordRef}
					enterFunction={setAccount}
					inputType="password"
				/>
			</div>
			
			{
				(loginFailed) && (
					<p className="LoginError">
						email or password is incorrect
					</p>
				)
			}
			<Button
				label="login"
				onClickFn={setAccount}
			/>
			<h2>Don't have an account?</h2>
			<h2>
			<NavLink to="/register">
				Register
            </NavLink>
			</h2>


			
        </div>
    );
}

export default Login;
