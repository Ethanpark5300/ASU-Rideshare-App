import { Account } from "../account/Account";
import { setAccountStore } from "../store/features/accountSlice";
import { useAppDispatch } from "../store/hooks";


export class DatabaseAccessor {
	private static instance: DatabaseAccessor;

	private constructor() { }

	public static getInstance(): DatabaseAccessor {
		if (!DatabaseAccessor.instance)
			DatabaseAccessor.instance = new DatabaseAccessor();
		return DatabaseAccessor.instance;
	}

	/**
	 * 
	 * @param email username
	 * @param password password
	 * @returns an Account if successful, undefined otherwise
	 */
	public login(email: string, password: string):Account | undefined {
		let hashedPassword: string = this.encrypt(password);
		let account: Account | undefined = undefined;
		//make sure legal login
		let loginSuccess = false;

		//TODO actually put in legit tests
		if (email.endsWith("@asu.edu")) {
			loginSuccess = true;
		}
		
		if (loginSuccess) {
			account = new Account(email);
		}
		//console.log(account?.email);

		return account;
	}
	/**
	 * registers an account in the database
	 * @param email
	 * @param password
	 * @param firstName
	 * @param lastName
	 * @returns true if successful, false otherwise
	 */
	public register(email: string, firstName: string, lastName: string, password: string): boolean {
		let registerSuccess: boolean = false;
		//TODO actually put in legit tests
		if (email.endsWith("@asu.edu")) {
			registerSuccess = true;
		}

		//TODO add data to database

		return registerSuccess; //if successful
	}

	/**
	 * use this before doing account operations
	 * @param account Account to be verified
	 * @returns true if it is a legit account
	 */
	public verifyAccount(account: Account): boolean {

		//TODO using parts of Account verify it is one
		return true;
	}

	/**
	 * 
	 * @param password string to be encrypted
	 * @returns encrypted password
	 */
	private encrypt(password: string): string {
		//TODO implement hashing
		return password;
	}
}