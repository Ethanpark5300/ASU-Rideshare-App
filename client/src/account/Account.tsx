
export class Account {
	public readonly email: string;
	public readonly firstName: string;
	public readonly lastName: string;
	public readonly phoneNumber: string | undefined;

	//do not store password
	//or do, as long as we don't store the hashed password
	constructor(email: string, firstName: string, lastName: string, phoneNumber: string) {
		//TODO more stuff here
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.phoneNumber = phoneNumber;
	}
}