import fs from 'fs';
import { Database } from 'sqlite3';
import express from 'express';
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
//const fs = require("fs");
//const sqlite3 = require("sqlite3");
//const Database = sqlite3.Database;
//const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser');


const PORT = process.env.PORT || 3001

let message: string | undefined;
let hadError: boolean;
app.use(cors());
app.use(express.json());
app.use(cookieParser('p3ufucaj55bi2kiy6lsktnm23z4c18xy'));

const saltRounds: number = 10;


//creating the table and storing it in
const user_info = new Database("user_info.db");

//just in case we need again
//user_info.exec(fs.readFileSync(__dirname + '/Tables/CREATE_USER_INFO.sql').toString());

//inserting data
//user_info.exec(fs.readFileSync(__dirname + '/Tables/INSERT_USER_INFO.sql').toString());


//app.get("/message", (req: Request, res: Response) => {
//	res.json({
//		message: "Hello from server!",
//		haha: req.request
//	});
//});


/**
 * body contains the properties email, firstName, lastName, password
 * @todo failed registrations don't display errors at first. FIXME
 */
app.post("/registration", async (req: Request, res: Response) => {
	//console.log(req.body.firstName);
	const salt: string = await bcrypt.genSalt(saltRounds);
	const hashedPassword: string = await bcrypt.hash(req.body.password, salt)
	//console.log("Hash: " + hashedPassword);

	const new_user = user_info.prepare(fs.readFileSync(__dirname + '/Tables/New_User.sql').toString());
	new_user.run([req.body.firstName, req.body.lastName, hashedPassword, req.body.email], cb);

	//console.log(message + " | " + req.body.email);

	res.json({
		registrationSuccess: !hadError,
		message: message,
	});
});

/**
 * body contains the properties email, password
 */
app.post("/login", (req: Request, res: Response) => {
	//console.log(req.body.email);
	//console.log(req.body.password);
	const options = {
		httpOnly: true,
		signed: true,
		/**@todo figure out if this is needed, and if it is, fix it*/
		//sameSite: "lax",
		/**@todo expiration by Max-Age/expires, if a timer beyond browser life wanted*/
	};

	const emailPassWrong: string = "Email or Password is incorrect";

	user_info.get(fs.readFileSync(__dirname + '/Tables/login.sql').toString(), [req.body.email], (err:Error, rows:any) => {
		if (rows=== undefined) {
			hadError = true; message = emailPassWrong;
		}else if (err) {
			hadError = true; message = err.message;
		} else {
			hadError = false;
			message = undefined;
		}


		if (!hadError) {
			//console.log("Comparing: " + req.body.password + " + " + rows.Password)
			bcrypt
				.compare(req.body.password, rows.Password)
				.then(result => {
					//console.log(result);
					if (result) {
						//cookie(name of cookie, value of cookie, options of cookie)
						res.cookie('loggedIn', rows.Email, options);
					} else {
						hadError = true;
						message = emailPassWrong;
					}
					res.json({

						loginSuccess: !hadError,
						message: message,
						account: {
							Email: rows?.Email ?? undefined,
							FirstName:rows?.First_Name ?? undefined,
							LastName:rows?.Last_Name ?? undefined,
							PhoneNumber:rows?.Phone_Number ?? undefined,
						}
					});

				})
				.catch(err => { hadError = true; message = err.message; });
		} else {
			res.json({

				loginSuccess: !hadError,
				message: message,
				account: {
					Email: rows?.Email ?? undefined,
				}
			});
		}
		
	});
	//sends the user to the next screen after login(home screen)
	//if (!hadError) {
	//	res.cookie('name', 'user type here', options);
	//}
	
	
});
/**
 * @todo return user info for account storing(email, first, last)
 * @returns user info
 */
app.get('/read-cookie', (req:Request, res:Response) => {
	console.log(req.signedCookies);
	//console.log(req.signedCookies.loggedIn);


	//cookie should store something and we can get the user info afterwards

	/**@todo do fetch*/
	res.json({
		account: {
			Email: req.signedCookies.loggedIn,

		}
	});
});
/**
 * logout
 */
app.get('/clear-cookie', (req:Request, res:Response) => {
	res.clearCookie('loggedIn').end();
});

function cb(err: Error | null) {
	if (err) {
		hadError = true;
		message = err.message;
	} else {
		hadError = false;
		message = undefined;
	}
}

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});