
export class Account {
	public readonly email: string; 

	//do not store password
	constructor(email: string) {
		this.email = email;
	}
}