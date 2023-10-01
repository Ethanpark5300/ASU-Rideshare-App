import { useRef, useState } from 'react';
import { Account } from '../account/Account';
import '../styles/Login.css';
import { useAppDispatch } from '../store/hooks';
import { setAccountStore } from '../store/features/accountSlice';
import { TextInput } from '../components/Text_Input/TextInput';
import Navbar from '../components/Navigation_Bar/Navbar';
import { DatabaseAccessor } from '../databases/DatabaseAccessor';


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
				/>
			</div>
			
			{
				(loginFailed) && (
					<p className="LoginError">
						email or password is incorrect
					</p>
				)
			}
			
        </div>
    );
}

export default Login;
