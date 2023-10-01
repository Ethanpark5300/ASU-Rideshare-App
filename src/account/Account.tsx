
export class Account {
	public readonly email: string; 

	//do not store password
	//or do, as long as we don't store the hashed password
	constructor(email: string) {
		//TODO more stuff here
		this.email = email;
	}
}