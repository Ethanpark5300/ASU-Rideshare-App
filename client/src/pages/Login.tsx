import { useEffect, useRef, useState } from 'react';
import { Account } from '../account/Account';
import '../styles/Login.css';
import { useAppDispatch } from '../store/hooks';
import { setAccountStore } from '../store/features/accountSlice';
import { TextInput } from '../components/Text_Input/TextInput';
import Navbar from '../components/Navigation_Bars/Guest_Navbar/Navbar';
import { DatabaseAccessor } from '../databases/DatabaseAccessor';
import { Link } from 'react-router-dom';
import { Button } from '../components/Buttons/Button';
import PageTitle from '../components/Page_Title/PageTitle';


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

	const [data, setData] = useState(null);

	useEffect(() => {
		fetch("/message")
			.then((res) => res.json())
			.then((data) => setData(data.message));
	}, []);



    return (
		<PageTitle title="Login">
			<Navbar />
			<div className='Login'>

				<div>{data ? data : "Loading"}</div>

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
				<h2> <Link to="/Register"> Register </Link> </h2>					
			</div>
		</PageTitle>
    );
}

export default Login;