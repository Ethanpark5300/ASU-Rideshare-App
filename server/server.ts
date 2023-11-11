import fs from 'fs';
import { Database } from 'sqlite3';
import express from 'express';

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

//creating the table and storing it in
const user_info = new Database("user_info.db");

//just in case we need again
//user_info.exec(fs.readFileSync(__dirname + '/Tables/CREATE_USER_INFO.sql').toString());

//inserting data
//user_info.exec(fs.readFileSync(__dirname + '/Tables/INSERT_USER_INFO.sql').toString());

app.get("/message", (req: any, res: any) => {
	res.json({
		message: "Hello from server!",
		haha: req.request
	});
});

/**
 * body contains the properties email, firstName, lastName, password
 */
app.post("/registration", (req: any, res: any) => {
	console.log(req.body.firstName);
	const new_user = user_info.prepare(fs.readFileSync(__dirname + '/Tables/New_User.sql').toString());
	new_user.run([req.body.firstName, req.body.lastName, req.body.password, req.body.email], cb);
	res.json({
		registrationSuccess: !hadError,
		message: message,
	});
});

/**
 * body contains the properties email, password
 */
app.post("/login", (req: any, res: any) => {
	console.log(req.body.email);
	console.log(req.body.password);
	const options = {
		httpOnly: true,
		signed: true,
	};
	user_info.get(fs.readFileSync(__dirname + '/Tables/login.sql').toString(), [req.body.email, req.body.password], (err:Error, rows:any) => {
		if (rows=== undefined) {
			hadError = true; message = "Email or Password is incorrect";
		}else if (err) {
			hadError = true; message = err.message;
		} else {
			hadError = false;
			message = undefined;
		}
		if (!hadError) {
			/**@todo add verification token to cookie*/
			res.cookie('name', 'user type here', options);
		}
		
		console.log(rows)
		res.json({

			loginSuccess: !hadError,
			message: message,

		});
	});
	//sends the user to the next screen after login(home screen)
	//if (!hadError) {
	//	res.cookie('name', 'user type here', options);
	//}
	
	
});
app.get('/read-cookie', (req:any, res:any) => {
	console.log(req.signedCookies);
	res.send({ screen: '/' });
});

app.get('/clear-cookie', (req:any, res:any) => {
	res.clearCookie('name').end();
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