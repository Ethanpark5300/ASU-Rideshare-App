import { useRef } from 'react';
import { Account } from '../account/Account';
import '../styles/Login.css';
import { useAppDispatch } from '../store/hooks';
import { setAccountStore } from '../store/features/accountSlice';

function Login() {
	const dispatch = useAppDispatch();

	const emailRef = useRef<string>("");
	function setAccount() {
		let account: Account | undefined = undefined;
		if (emailRef.current.endsWith("@asu.edu")){
			account = new Account(emailRef.current);
		}
		dispatch(setAccountStore(account));
	}

    return (
        <div className='Login'>
            <h1>Login</h1>
        </div>
    );
}

export default Login;
