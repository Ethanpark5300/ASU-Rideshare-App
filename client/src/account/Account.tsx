export class Account {
	public readonly email: string;
	public readonly firstName: string;
	public readonly lastName: string;
	public readonly phoneNumber: string;
	public readonly accountType: AccountTypeFlag;
	public readonly paypalEmail: string;
	public readonly status: string;



	constructor(email: string, firstName: string, lastName: string, phoneNumber: string, accountType:number, payPalEmail: string, status: string) {
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.phoneNumber = phoneNumber;
		this.accountType = accountType;
		this.paypalEmail = payPalEmail;
		this.status = status;
	}
}

/**
 * this is a bitflag; each bit corresponds to has/not a certain property
 * A rider has a value of 1, or 01
 * A driver has a value of 2, or 10
 * A driver+rider has a value of 3, or 11
 * When comparing flags, use bitwise and: &. Returns 0 for no matches, or some number corresponding to matches.
 * When adding flags together, use bitwise or: |. Returns combination of both sets of flags.
 */
export enum AccountTypeFlag {
	None = 0, //no standard account should have none here
	Rider = 1 << 0, //...001
	Driver = 1 << 1, //...010
}