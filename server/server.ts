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
import { randomInt, randomUUID } from 'crypto';
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
const database = new Database("./database.db", (err: Error | null) => {
	if (err) return console.error(err.message);
});
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

makeTableExist("USER_INFO", fs.readFileSync(__dirname + '/Tables/CREATE_USERINFO_TABLE.sql').toString(), fs.readFileSync(__dirname + '/Tables/INSERT_USERINFO_TABLE.sql').toString());
makeTableExist("BLOCKED", fs.readFileSync(__dirname + '/Tables/CREATE_BLOCKED_TABLE.sql').toString());
makeTableExist("FAVORITES", fs.readFileSync(__dirname + '/Tables/CREATE_FAVORITES_TABLE.sql').toString());
makeTableExist("PAYMENTS", fs.readFileSync(__dirname + '/Tables/CREATE_PAYMENTS_TABLE.sql').toString());
makeTableExist("RATINGS", fs.readFileSync(__dirname + '/Tables/CREATE_RATINGS_TABLE.sql').toString());
makeTableExist("REPORTS", fs.readFileSync(__dirname + '/Tables/CREATE_REPORTS_TABLE.sql').toString());
makeTableExist("PENDING_DRIVERS", fs.readFileSync(__dirname + '/Tables/CREATE_PENDINGDRIVERS_TABLE.sql').toString());
makeTableExist("RIDES", fs.readFileSync(__dirname + '/Tables/CREATE_RIDES_TABLE.sql').toString());
makeTableExist("REGISTER", fs.readFileSync(__dirname + '/Tables/CREATE_REGISTER_TABLE.sql').toString());

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
 */
app.post("/registration", async (req: Request, res: Response) => {
	//console.log(req.body.firstName);
	const salt: string = await bcrypt.genSalt(saltRounds);
	const hashedPassword: string = await bcrypt.hash(req.body.password, salt)
	//console.log("Hash: " + hashedPassword);
	//database.all("SELECT * FROM REGISTER", (err: Error, rows: Object) => {
	//	console.log(rows);
	//});

	database.get("SELECT 1 FROM USER_INFO WHERE Email = ?", [req.body.email], (err:Error, userExist:any) => {
		if (userExist) {
			res.json({
				registrationSuccess: false,
				message: "User already exists!",
			})
		} else {
			let UUID: string = generateRegisterID();
			//console.log("UUID: " + UUID);
			database.run('INSERT OR REPLACE INTO REGISTER (First_Name, Last_Name, Password_User, Email, Register_ID) VALUES(?,?,?,?,?)', [req.body.firstName, req.body.lastName, hashedPassword, req.body.email, UUID], (err: Error, rows: Object) => {
				if (err) {
					hadError = true;
					message = err.message;
				} else {
					hadError = false;
					message = undefined;
				}
				//database.all("SELECT * FROM REGISTER", (err: Error, rows: Object) => {
				//	console.log(rows);
				//});
				//console.log(message + " | " + req.body.email);
				setVerifyCookie(res, req.body.email);
				res.json({
					registrationSuccess: !hadError,
					message: message,
				});
			});
		}
	});
});

/**
 * @todo do this after email can be sent
 */
app.post("/resend_registration", async (req: Request, res: Response) => {

});

/**
 * body contains the property register_ID
 */
app.post("/registration_verification", (req: Request, res: Response) => {

	//console.log(req.signedCookies.registerCookie);
	if (req.signedCookies.registerCookie === undefined) {
		res.json({
			registrationSuccess: false,
			message: "Verification ID expired!",
		});
		return;
	}

	database.get("SELECT Register_ID, Email, First_Name, Last_Name, Password_User FROM REGISTER WHERE Email = ?;", [req.signedCookies.registerCookie], (err: Error, row: any) => {
		if (row === undefined) {
			hadError = true; message = err.message ?? "Something went wrong";
		} else if (err) {
			hadError = true; message = err.message;
		} else {
			hadError = false;
			message = undefined;
		}
		//console.log(row);
		if (hadError) {
			res.json({
				registrationSuccess: false,
				message: message,
			});
			return;
		}
		
		//console.log("Compare " + row.Register_ID + " = " + req.body.register_ID);

		if (row.Register_ID === req.body.register_ID) {
			//do registration
			row.Type_User = 1;
			database.run('INSERT INTO USER_INFO (First_Name, Last_Name, Password_User, Email, Type_User) VALUES(?,?,?,?,?)', [row.First_Name, row.Last_Name, row.Password_User, row.Email, row.Type_User], (err: Error, rows: Object) => {
				let accObj = accountObject(row);
				if (err) {
					hadError = true;
					message = err.message;
				} else {
					hadError = false;
					message = undefined;
					setTokenCookie(res, accObj);
				}
				//database.all("SELECT * FROM USER_INFO", (err: Error, rows: Object) => {
				//	console.log(rows);
				//});
				
				res.json({
					registrationSuccess: !hadError,
					message: message,
					account: accObj,
				});
			});

			database.run('DELETE FROM REGISTER WHERE Email = ?', [row.Email], (err: Error, rows: Object) => {
				if (err) {
					console.error(err.message);
				}
				//database.all("SELECT * FROM REGISTER", (err: Error, rows: Object) => {
				//	console.log(rows);
				//});
			});
		} else {
			res.json({
				registrationSuccess: false,
				message: message,
			});
		}
	});
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
	//console.log(verifyAcc);
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
		PayPalEmail: rows?.Pay_Pal ?? undefined,
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
		maxAge: 24 * 60 * 60 * 1000, //24 hours
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

function setVerifyCookie(res: Response, email: string) {
	const options = {
		httpOnly: true,
		signed: true,
		sameSite: 'lax' as const,
		maxAge: 5 * 60 * 1000, //5 minutes
	};

	res.cookie('registerCookie', email, options);
}

function generateRegisterID(): string {
	return ('0000' + randomInt(99999)).slice(-5);
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

/** Send block info to the blocked database */
app.post("/send-blocked", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let blocker_ID = req.body.blocker;
	let blockee_ID = req.body.blockee;
	let currentDate = new Date().toLocaleDateString();
	let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	await db.run('INSERT INTO BLOCKED (Blocker_ID, Blockee_ID, Date, Time) VALUES (?,?,?,?)', blocker_ID, blockee_ID, currentDate, currentTime);
});

// Insert ratings to ratings table and calculate/update average ratings
app.post("/send-ratings", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let rater_ID = req.body.rater;
	let ratee_ID = req.body.ratee;
	let star_rating = req.body.star_rating;
	let comments = req.body.comments;
	let currentDate = new Date().toLocaleDateString();
	let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	let rateeUserType = await db.get(`SELECT Type_User FROM USER_INFO WHERE Email = '${ratee_ID}'`);
	let favoriteDriverRequest = req.body.favorited_driver;

	// Insert ratings to ratings table
	await db.run('INSERT INTO RATINGS (Rater_ID, Ratee_ID, Star_Rating, Comments, Date, Time) VALUES (?,?,?,?,?,?)', rater_ID, ratee_ID, star_rating, comments, currentDate, currentTime);

	// Calculate and update driver's average rating
	if (rateeUserType.Type_User === 2 || rateeUserType.Type_User === 3) {
		let defaultRating = await db.get(`SELECT Rating_Driver FROM USER_INFO WHERE Email = '${ratee_ID}'`);
		let ratings = await db.all(`SELECT Star_Rating FROM RATINGS WHERE Ratee_ID = '${ratee_ID}'`);
		let totalRating = 0;
		
		for (let i = 0; i < ratings.length; i++) {
			totalRating += ratings[i].Star_Rating;
		}
		
		let updatedAvgRating = (defaultRating.Rating_Driver * ratings.length + star_rating) / (ratings.length + 1);
		await db.run(`UPDATE USER_INFO SET Rating_Driver = ? WHERE Email = ?`, updatedAvgRating, ratee_ID);
		// console.log(`${ratee_ID}'s average rating updated`);
	} 
	else { // Calculate and update rider's average rating
		let defaultRating = await db.get(`SELECT Rating_Passenger FROM USER_INFO WHERE Email = '${ratee_ID}'`);
		let ratings = await db.all(`SELECT Star_Rating FROM RATINGS WHERE Ratee_ID = '${ratee_ID}'`);
		let totalRating = 0;

		for (let i = 0; i < ratings.length; i++) {
			totalRating += ratings[i].Star_Rating;
		}

		let updatedAvgRating = (defaultRating.Rating_Passenger * ratings.length + star_rating) / (ratings.length + 1);
		await db.run(`UPDATE USER_INFO SET Rating_Passenger = ? WHERE Email = ?`, updatedAvgRating, ratee_ID);
		// console.log(`${ratee_ID}'s average rating updated`);
	}

	/** @TODO Send favorite request to specific driver if favoriteDriverRequest returns true */
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
	let driverEmail = "Test" /** @TODO Replace value with actual driver email ID */
	let rideCost = req.body.rideCost;
	let currentDate = new Date().toLocaleDateString();
	let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

	await db.run(`INSERT INTO PAYMENTS (Rider_ID, Driver_ID, Ride_Cost, Date, Time) VALUES (?,?,?,?,?)`, rider_ID, driverEmail, rideCost, currentDate, currentTime);
	await db.run(`DELETE FROM PAYMENTS WHERE Payment_ID NOT IN (SELECT MIN(Payment_ID) FROM PAYMENTS GROUP BY Rider_ID, Driver_ID, Ride_Cost, Date, Time)`); /* Delete duplicate records from the table */
});

/** Update account information */
app.post("/edit-account", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let account = {
		Email: req.body.userEmail,
		FirstName: req.body.newFirstName,
		LastName: req.body.newLastName,
		AccountType: req.body.newAccountType,
		PayPalEmail: req.body.newPaypalEmail,
		PhoneNumber: req.body.newPhoneNumber,
	};

	await db.run(`UPDATE USER_INFO SET First_Name = ?, Last_Name = ?, Type_User = ?, Pay_Pal = ?, Phone_Number = ? WHERE Email = ?`, [account.FirstName, account.LastName, account.AccountType, account.PayPalEmail, account.PhoneNumber, account.Email]);
	setTokenCookie(res, account);
});

/** @returns account information */
app.get("/view-account-info", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let userEmail = req.query.accountEmail;

	let account = await db.all(`SELECT * FROM USER_INFO WHERE Email = ?`, [userEmail])

	res.json({
		account: account[0]
	});
});

/** Sends ride information to ride queue table */
app.post("/ride-queue", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let rider_id = req.body.rider_id;
	let pickupLocation = req.body.pickupLocation;
	let dropoffLocation = req.body.dropoffLocation;
	let cost = req.body.rideCost;

	let riderFirstName = await db.get(`SELECT First_Name FROM USER_INFO WHERE Email='${rider_id}'`);
	let riderLastName = await db.get(`SELECT Last_Name FROM USER_INFO WHERE Email='${rider_id}'`);
	let rideCost = "$" + cost;

	await db.run(`INSERT INTO RIDES (Rider_ID, Rider_FirstName, Rider_LastName, Pickup_Location, Dropoff_Location, Ride_Cost, Queue_Status) VALUES (?,?,?,?,?,?,?)`, rider_id, riderFirstName.First_Name, riderLastName.Last_Name, pickupLocation, dropoffLocation, rideCost, "TRUE")
});

/** Riders cancelling */
app.get("/cancel-request", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let rider_id = req.query.riderid;

	await db.run(`DELETE FROM RIDES WHERE Rider_ID = '${rider_id}' AND Queue_Status = "TRUE"`);
	await db.run(`DELETE FROM PENDING_DRIVERS WHERE Rider_ID = '${rider_id}'`);
});

/** @returns available drivers */
app.get("/available-drivers", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderEmail = req.query.riderid;

	// Set rider status to false
	await db.run(`UPDATE USER_INFO SET Status_User = 'FALSE' WHERE Email = '${riderEmail}'`);

	// Get favorite drivers who are available and not blocked
	let getFavoriteDriversList = await db.all(`SELECT Driver_ID FROM FAVORITES WHERE Rider_ID = ?`, [riderEmail]);
	let favoriteDriverEmails = getFavoriteDriversList.map((driver: { Driver_ID: string; }) => driver.Driver_ID);

	let getBlockedDriversList = await db.all(`SELECT Blockee_ID FROM BLOCKED WHERE Blocker_ID = ?`, [riderEmail]);
	let blockedDriverEmails = getBlockedDriversList.map((driver: { Blockee_ID: string; }) => driver.Blockee_ID);

	let getBlockeeDriversList = await db.all(`SELECT Blocker_ID FROM BLOCKED WHERE Blockee_ID = ?`, [riderEmail]);
	let blockingDriverEmails = getBlockeeDriversList.map((driver: { Blocker_ID: string; }) => driver.Blocker_ID);

	// Combine both lists to create a list of all blocked drivers
	let excludedDriverEmails = [...blockedDriverEmails, ...blockingDriverEmails];

	// Filter available favorite drivers
	let availableFavoriteDrivers = await db.all(`SELECT Email, First_Name, Last_Name FROM USER_INFO WHERE Email IN (${favoriteDriverEmails.map(() => '?').join(', ')}) AND Type_User IN (2, 3) AND Status_User = 'TRUE'`, favoriteDriverEmails);

	// Filter other available drivers excluding favorite drivers and blocked drivers
	let otherAvailableDrivers = await db.all(`SELECT Email, First_Name, Last_Name FROM USER_INFO WHERE Type_User IN (2, 3) AND Status_User = 'TRUE' AND Email NOT IN (${[...favoriteDriverEmails, ...excludedDriverEmails].map(() => '?').join(', ')})`, [...favoriteDriverEmails, ...excludedDriverEmails]);

	res.json({
		availableFavoriteDrivers: availableFavoriteDrivers,
		otherAvailableDrivers: otherAvailableDrivers
	});
});

app.post("/request-driver", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let rider_id = req.body.rider;
	let driverFirstName = req.body.selectedDriverFirstName;
	let driverLastName = req.body.selectedDriverLastName;
	let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

	let driverEmail = await db.get(`SELECT Email FROM USER_INFO WHERE First_Name = ? AND Last_Name = ?`, driverFirstName, driverLastName);

	// Insert the pending driver record into the PENDING_DRIVERS table
	await db.run(`INSERT INTO PENDING_DRIVERS (Rider_ID, Driver_ID, Time) VALUES (?,?,?)`, rider_id, driverEmail.Email, currentTime);

	// Retrieve the updated list of pending drivers
	let pendingDriversList = await db.all(`SELECT PENDING_DRIVERS.PendingDriver_ID, USER_INFO.First_Name, USER_INFO.Last_Name FROM USER_INFO INNER JOIN PENDING_DRIVERS ON USER_INFO.Email = PENDING_DRIVERS.Driver_ID`);

	res.json({
		pendingDriversList: pendingDriversList,
	});
});

app.post("/cancel-request-driver", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let rider_id = req.body.rider;
	let driverFirstName = req.body.selectedDriverFirstName;
	let driverLastName = req.body.selectedDriverLastName;

	let driverEmail = await db.get(`SELECT Email FROM USER_INFO WHERE First_Name = ? AND Last_Name = ?`, driverFirstName, driverLastName);

	// Delete the pending driver record from the PENDING_DRIVERS table
	await db.run(`DELETE FROM PENDING_DRIVERS WHERE Rider_ID = ? AND Driver_ID = ?`, rider_id, driverEmail.Email);
	
	res.json({
		cancelledDriver: driverEmail.Email,
	});
});

/** @returns available riders */
app.get("/ride-queue", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let driverEmail = req.query.driveremail;

	// Get all ride requests with status "TRUE"
	let getRidersRequests = await db.all(`SELECT Ride_ID, Rider_ID, Rider_FirstName, Rider_LastName, Pickup_Location, Dropoff_Location FROM RIDES WHERE Queue_Status="TRUE"`);

	// Get all riders who blocked the driver
	let getBlockedRiders = await db.all(`SELECT Blockee_ID FROM BLOCKED WHERE Blocker_ID = ?`, [driverEmail]);

	// Get all riders whom the driver blocked
	let getBlockeeRiders = await db.all(`SELECT Blocker_ID FROM BLOCKED WHERE Blockee_ID = ?`, [driverEmail]);

	// Combine both lists to create a list of all blocked riders
	let excludedRiderEmails = [...getBlockedRiders.map((rider: { Blockee_ID: string; }) => rider.Blockee_ID), ...getBlockeeRiders.map((rider: { Blocker_ID: string; }) => rider.Blocker_ID)];

	// Filter out blocked riders from all ride requests
	let allRequestsList = getRidersRequests.filter((request: { Rider_ID: string; }) => !excludedRiderEmails.includes(request.Rider_ID));

	// Get pending rider requests for the specific driver
	let getPendingRiderRequests = await db.all(`SELECT RIDES.Ride_ID, RIDES.Rider_ID, RIDES.Rider_FirstName, RIDES.Rider_LastName, RIDES.Pickup_Location, RIDES.Dropoff_Location FROM PENDING_DRIVERS INNER JOIN RIDES ON PENDING_DRIVERS.Rider_ID = RIDES.Rider_ID WHERE PENDING_DRIVERS.Driver_ID = '${driverEmail}'`);
	
	res.json({
		pendingRiderRequestsList: getPendingRiderRequests,
		allRequestsList: allRequestsList
	});
});

/** @returns ride/drive history */
/** @TODO Insert values after a ride is over (Save for end) */
// app.get("/ride-history", async (req: Request, res: Response) => {
// 	let db = await dbPromise;
// 	let accountEmail = req.query.accountEmail;


// 	let getRiderHistoryResults = await db.all(`SELECT Driver_FirstName, Driver_LastName, Pickup_Time, Dropoff_Location, Ride_Date, Cost, Given_Rider_Rating FROM RIDE_HISTORY WHERE Rider_ID='${accountEmail}'`)
// 	let getDriverHistoryResults = await db.all(`SELECT Rider_FirstName, Rider_LastName, Ride_Date, Pickup_Time, Dropoff_Location, Earned, Given_Driver_Rating FROM RIDE_HISTORY WHERE Driver_ID='${accountEmail}'`);

// 	res.json({
// 		ridersHistoryList: getRiderHistoryResults,
// 		driversHistoryList: getDriverHistoryResults
// 	});
// });

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});