import { useRef } from 'react';
import { Account } from '../account/Account';
import '../styles/Login.css';
import { useAppDispatch } from '../store/hooks';
import { setAccountStore } from '../store/features/accountSlice';
import { TextInput } from '../components/Text_Input/TextInput';
import Navbar from '../components/Navigation_Bar/Navbar';

function Login() {
	const dispatch = useAppDispatch();

	const emailRef = useRef<string>("");
	function setAccount() {
		let account: Account | undefined = undefined;
		//make sure legal login
		if (emailRef.current.endsWith("@asu.edu")){
			account = new Account(emailRef.current);
		}
		dispatch(setAccountStore(account));
		console.log(account?.email);
	}

    return (
		<div className='Login'>
			<Navbar />
			<h1>Login</h1>

			<TextInput
				placeholder=""
				regex={/^[a-zA-Z0-9_@.]+$/}
				valueRef={emailRef}
				enterFunction={setAccount }
			/>
        </div>
    );
}

export default Login;
