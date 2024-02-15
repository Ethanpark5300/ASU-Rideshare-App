import 'dotenv/config'; //THIS GOES FIRST
import nodemailer from 'nodemailer';
import fs from 'fs';
import { Database } from 'sqlite3';
import express, { NextFunction } from 'express';
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

import sqlite3 from 'sqlite3';
import sqlite, { open } from 'sqlite';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { table } from 'console';
//const fs = require("fs");
//const sqlite = require("sqlite")
//const sqlite3 = require("sqlite3");
//const Database = sqlite3.Database;
//const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser');


const PORT = process.env.PORT || 3001;
//process.env is set outside
const JWT_SECRET = process.env.JWT_SECRET || "DevelopmentSecretKey";
const COOKIEPARSER_SECRET = process.env.COOKIEPARSER_SECRET || 'p3ufucaj55bi2kiy6lsktnm23z4c18xy';

let message: string | undefined;
let hadError: boolean;
app.use(cors());
app.use(express.json());
app.use(cookieParser(COOKIEPARSER_SECRET));

const saltRounds: number = 10;
let dbPromise: any

//creating the table and storing it in
const database = new Database("./database.db");
(async () => {
	dbPromise = await open({
		filename: './database.db',
		driver: sqlite3.Database
	})
})()

/**
 * If given table doesn't exist in user_info database, run createTableSQL to make it and fillTableSQL to fill it, if provided.
 * @param tableName name of the table
 * @param createTableSQL sql to create the table
 * @param fillTableSQL optional, sql to fill the table with dummy data
 */
const makeTableExist = (tableName: string, createTableSQL: string, fillTableSQL?: string) => {
	//check to see if USER_INFO exists and if it doesnt make it
	database.get(`SELECT 1 FROM sqlite_schema WHERE type='table' AND name='${tableName}';`, (err: Error | null, rows: any) => {
		console.log(`Check table ${tableName}:`)
		if (err) {
			console.log(err.message);
		}
		if (rows) {
			console.log(`${tableName} already exists.`);
		} else {
			console.log(`${tableName} does not exist, make table.`);
			//just in case we need again
			database.exec(createTableSQL);

			if (fillTableSQL) {
				console.log(`Adding dummy data to ${tableName}.`);
				//inserting dummy data
				database.exec(fillTableSQL);
			}
			
		}
	});
}

makeTableExist("USER_INFO", fs.readFileSync(__dirname + '/Tables/CREATE_USER_INFO.sql').toString(), fs.readFileSync(__dirname + '/Tables/INSERT_USER_INFO.sql').toString());


//app.get("/message", (req: Request, res: Response) => {
//	res.json({
//		message: "Hello from server!",
//		haha: req.request
//	});
//});

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD
	}
});

/**
 * 
 * @param email email to send to
 * @param verifyID unique generated ID that is sent in the content of the email
 */
const sendRegisterVerifyEmail = (email: string, verifyID: string) => {
	const mailOptions = {
		from: process.env.EMAIL_USERNAME,
		to: email,
		subject: "Email Verification",
		text: "This email was recently used in registration. Enter this string of characters to verify your email.\n" + verifyID + "\n\n If this wasn't you, ignore this email.",
	}

	transporter.sendMail(mailOptions, (err: Error | null, info: SMTPTransport.SentMessageInfo) => {
		if (err) {
			console.error(err.message);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
}

/**
 * body contains the properties email, firstName, lastName, password
 * @todo failed registrations don't display errors at first. FIXME
 */
app.post("/registration", async (req: Request, res: Response) => {
	//console.log(req.body.firstName);
	const salt: string = await bcrypt.genSalt(saltRounds);
	const hashedPassword: string = await bcrypt.hash(req.body.password, salt)
	//console.log("Hash: " + hashedPassword);

	const db = new Database("./database/user_info.db", (err: Error | null) => {
		if (err) return console.log(err.message);
	});
	db.run('INSERT INTO USER_INFO (FIRST_NAME, LAST_NAME, PASSWORD_USER, EMAIL) VALUES(?,?,?,?)', [req.body.firstName, req.body.lastName, hashedPassword, req.body.email], (err: Error, rows: Object) => {
		if (err) {
			hadError = true;
			message = err.message;
		} else {
			hadError = false;
			message = undefined;
		}

		//console.log(message + " | " + req.body.email);

		res.json({
			registrationSuccess: !hadError,
			message: message,
		});
	});
});

/**
 * body contains the property 
 */
app.post("/registration_verification", (req: Request, res: Response) => {

});

/**
 * body contains the properties email, password
 */
app.post("/login", (req: Request, res: Response) => {
	//console.log(req.body.email);
	//console.log(req.body.password);


	const emailPassWrong: string = "Email or Password is incorrect";

	database.get(fs.readFileSync(__dirname + '/Tables/login.sql').toString(), [req.body.email], (err: Error, rows: any) => {
		if (rows === undefined) {
			hadError = true; message = emailPassWrong;
		} else if (err) {
			hadError = true; message = err.message;
		} else {
			hadError = false;
			message = undefined;
		}


		if (!hadError) {
			//console.log("Comparing: " + req.body.password + " + " + rows.Password_User)
			bcrypt
				.compare(req.body.password, rows.Password_User)
				.then(result => {
					//console.log(result);
					let accObj = accountObject(rows);
					if (result) {
						setTokenCookie(res, accObj);
					} else {
						hadError = true;
						message = emailPassWrong;
					}
					res.json({

						loginSuccess: !hadError,
						message: message,
						account: accObj,
					});

				})
				.catch(err => { hadError = true; message = err.message; });
		} else {
			res.json({

				loginSuccess: !hadError,
				message: message,
				account: undefined
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
app.get('/read-cookie', (req: Request, res: Response) => {
	//console.log(req.signedCookies);
	//console.log("----");
	//console.log(req.signedCookies.sessionToken);
	//console.log("----");

	//cookie should store something and we can get the user info afterwards

	const verifyAcc: Object | undefined = verifyToken(req.signedCookies.sessionToken);

	//return null for json to not throw out errors on the client side
	res.json(verifyAcc ?? null);
});
/**
 * logout
 */
app.get('/clear-cookie', (req: Request, res: Response) => {
	res.clearCookie('sessionToken').end();
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

/**
 * returns an object to be put in account: object returned
 * @todo I don't know what rows type actually is, unfortunately, so fix that if able
 * 
 * @param rows returned rows from some sql statement
 * @returns
 */
function accountObject(rows: any) {
	return {
		Email: rows?.Email ?? undefined,
		FirstName: rows?.First_Name ?? undefined,
		LastName: rows?.Last_Name ?? undefined,
		PhoneNumber: rows?.Phone_Number ?? undefined,
		AccountType: rows?.Type_User ?? 0,
	};
}

/**
 * res should be passed by reference, and modified here to give a cookie to it
 * @param res
 */
function setTokenCookie(res: Response, accObj: any) {
	const options = {
		httpOnly: true,
		signed: true,
		sameSite: 'lax' as const,
		maxAge: 2 * 60 * 60 * 1000, //2 hours
	};

	const sessionTokenOptions = {
		expiresIn: "1d",
	}

	const sessionToken: string = jwt.sign(
		accObj, //payload
		JWT_SECRET, //key
		sessionTokenOptions //options
	);


	//cookie(name of cookie, value of cookie, options of cookie)
	res.cookie('sessionToken', sessionToken, options);

}

/**
 * Verifies the session token is proper. Returned value can be used as true on success, false on error
 * @param token
 * @returns object with account details if validated, and undefined if error
 */
const verifyToken = function (token: string): Object | undefined {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (e) {
		return undefined;
	}

}
/** Send block info to the blocked database*/
app.post("/send-blocked", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let blocker_ID = req.body.blocker;
	let blockee_ID = req.body.blockee;
	let currentDate = new Date().toLocaleDateString();
	let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	/** @TODO Get blockee first and last name with reportee email */
	let blockee_FirstName = "Test";
	let blockee_LastName = "Test";

	await db.run('INSERT INTO BLOCKED (Blocker_ID, Blockee_ID, Blockee_FirstName, Blockee_LastName, Date, Time) VALUES (?,?,?,?,?,?)', blocker_ID, blockee_ID, blockee_FirstName, blockee_LastName, currentDate, currentTime);
});

/** Send ratings to the ratings database*/
app.post("/send-ratings", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let rater_ID = req.body.rater;
	let ratee_ID = req.body.ratee;
	let star_rating = req.body.star_rating;
	let comments = req.body.comments;
	let favorite_driver = req.body.favorited_driver /** @returns true if favorited/false if not favorited */
	let currentDate = new Date().toLocaleDateString();
	let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	/** @TODO Get ratee first and last name with ratee email */
	let ratee_FirstName = "Test"
	let ratee_LastName = "Test"

	await db.run('INSERT INTO RATINGS (Rater_ID, Ratee_ID, Ratee_FirstName, Ratee_LastName, Star_Rating, Comments, Date, Time) VALUES (?,?,?,?,?,?,?,?)', rater_ID, ratee_ID, ratee_FirstName, ratee_LastName, star_rating, comments, currentDate, currentTime);

	/** @TODO Calculate new average user rating with aggregate average */
	/** @TODO Add driver to the rider's favorites list if favoritedDriver is true */
});

/** Send report to reports database */
app.post("/send-report", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let reporter_ID = req.body.reporter;
	let reportee_ID = req.body.reportee;
	let reason = req.body.reason;
	let comments = req.body.comments;
	let currentDate = new Date().toLocaleDateString();
	let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	await db.run(`INSERT INTO REPORTS (Reporter_ID, Reportee_ID, Reason, Comments, Date, Time) VALUES (?,?,?,?,?,?)`, reporter_ID, reportee_ID, reason, comments, currentDate, currentTime);
});

/** Send payment to payments database */
app.post("/send-payment", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let rider_ID = req.body.Rider_ID;
	let driverPayPalEmail = req.body.driverPayPalEmail;
	let rideCost = req.body.rideCost;
	let currentDate = new Date().toLocaleDateString();
	let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

	let driverEmail = "Test" /** @TODO Replace value with actual driver email ID */

	await db.run(`INSERT INTO PAYMENTS (Rider_ID, Driver_ID, Ride_Cost, Date, Time) VALUES (?,?,?,?,?)`, rider_ID, driverEmail, rideCost, currentDate, currentTime);

	/* Delete duplicate records from the table */
	await db.run(`DELETE FROM PAYMENTS WHERE Payment_ID NOT IN (SELECT MIN(Payment_ID) FROM PAYMENTS GROUP BY Rider_ID, Driver_ID, Ride_Cost, Date, Time)`);
});

app.get("/ride-history", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let accountEmail = req.query.accountEmail;

	let getRiderHistoryResults = await db.all(`SELECT RideHistory_ID, Driver_FirstName, Driver_LastName, Pickup_Time, Dropoff_Location, Ride_Date, Cost, Given_Rider_Rating FROM RIDE_HISTORY WHERE Rider_ID='${accountEmail}'`)
	let getDriverHistoryResults = await db.all(`SELECT RideHistory_ID, Rider_FirstName, Rider_LastName, Ride_Date, Pickup_Time, Dropoff_Location, Earned, Given_Driver_Rating FROM RIDE_HISTORY WHERE Driver_ID='${accountEmail}'`);

	res.json({
		ridersHistoryList: getRiderHistoryResults,
		driversHistoryList: getDriverHistoryResults
	});
})

app.get("/available-drivers", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderEmail = req.query.riderEmail;

	// Set rider status to false
	await db.run(`UPDATE USER_INFO SET Status_User = 'FALSE' WHERE Email = '${riderEmail}'`);

	let getFavoriteDriversListResults = await db.all(`SELECT * FROM Favorites WHERE Rider_Email = '${riderEmail}'`);
	let getAvailableDriversListResults = await db.all(`SELECT * FROM USER_INFO WHERE Type_User IN (2, 3) AND Status_User = 'TRUE'`);
	let getBlockedDriversListResults = await db.all(`SELECT * FROM BLOCKED WHERE rider_id = '${riderEmail}'`);



	/** @TODO Drivers who blocked the rider should not show */

	res.json({
		// availableFavoriteDrivers: availableFavoriteDrivers,
		// otherAvailableDrivers: otherAvailableDrivers
	});
});

app.post("/ride-queue", async (req: Request, res: Response) => {
	(async () => {
		let riderEmail = req.body.rider_id;
		let pickupLocation = req.body.pickupLocation;
		let dropoffLocation = req.body.dropoffLocation;

		const [dbUserInfoPromise, dbRideQueuePromise] = await Promise.all([
			open({
				filename: './database/user_info.db',
				driver: sqlite3.Database
			}),
			open({
				filename: './database/ride_queue.sqlite',
				driver: sqlite3.Database
			}),
		])

		let Rider_FirstName = await dbUserInfoPromise.get(`SELECT First_Name FROM USER_INFO WHERE Email='${riderEmail}'`)
		let Rider_LastName = await dbUserInfoPromise.get(`SELECT Last_Name FROM USER_INFO WHERE Email='${riderEmail}'`)

		await dbRideQueuePromise.run(`INSERT INTO Ride_Queue (Rider_ID, Rider_FirstName, Rider_LastName, Pickup, Dropoff, Status) VALUES (?,?,?,?,?,?)`, riderEmail, Rider_FirstName.First_Name, Rider_LastName.Last_Name, pickupLocation, dropoffLocation, "FALSE")
	})()
});

app.get("/ride-queue", async (req: Request, res: Response) => {
	(async () => {
		let accountEmail = req.query.accountEmail;

		const [dbGetRideQueuePromise] = await Promise.all([
			open({
				filename: './database/ride_queue.sqlite',
				driver: sqlite3.Database
			}),
			// open({
			// 	filename: '/tmp/database2.db',
			// 	driver: sqlite3.Database
			// }),
		])

		let allRequestsList = await dbGetRideQueuePromise.all(`SELECT * FROM Ride_Queue`)

		res.json({
			// pendingRequestsList: allPendingRequestsList,
			allRequestsList: allRequestsList,
		});
	})()
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});