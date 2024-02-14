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


//creating the table and storing it in
const user_info = new Database("./database/user_info.db");

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD
	}
});



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

		console.log(message + " | " + req.body.email);

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

	user_info.get(fs.readFileSync(__dirname + '/Tables/login.sql').toString(), [req.body.email], (err: Error, rows: any) => {
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
	(async () => {
		let rider_id = req.body.rider_id;
		let driver_id = req.body.driver_id; /** @TODO Replace value with actual driver email */
		let currentDate = new Date().toLocaleDateString();
		let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

		const dbBlockedPromise = await open({
			filename: './database/blocked.sqlite',
			driver: sqlite3.Database
		})
		await dbBlockedPromise.run('INSERT INTO BLOCKED (rider_id, driver_id, date, time) VALUES(?,?,?,?)', rider_id, driver_id, currentDate, currentTime);
	})()
});

/** Send ratings to the ratings database*/
app.post("/send-ratings", async (req: Request, res: Response) => {
	(async () => {
		let rater = req.body.rater;
		let ratee = req.body.ratee; /** @TODO Replace value with actual ratee email */
		let star_rating = req.body.star_rating;
		let comments = req.body.comments;
		let favoritedDriver = req.body.favoritedDriver /** @returns true if favorited and false if not favorited */
		let currentDate = new Date().toLocaleDateString();
		let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

		const dbRatingsPromise = await open({
			filename: './database/ratings.sqlite',
			driver: sqlite3.Database
		})

		await dbRatingsPromise.run('INSERT INTO Ratings (Rater, Ratee, Star_Rating, Comments, Date, Time) VALUES (?,?,?,?,?,?)', rater, ratee, star_rating, comments, currentDate, currentTime);

		/** @TODO Calculate new average user rating with aggregate average */
		/** @TODO Add driver to the rider's favorites list if favoritedDriver is true */
	})()
});

/** Send report to reports database */
app.post("/send-report", async (req: Request, res: Response) => {
	(async () => {
		let email = req.body.email;
		let reportedId = req.body.reportedUser; /** @TODO Replace value with actual reportee email */
		let reason = req.body.reason;
		let comments = req.body.comments;
		let currentDate = new Date().toLocaleDateString();
		let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

		const dbReportPromise = await open({
			filename: './database/reports.sqlite',
			driver: sqlite3.Database
		})

		await dbReportPromise.run(`INSERT INTO Reports (Email, Reported_ID, Reason, Comments, Date, Time) VALUES (?,?,?,?,?,?)`, email, reportedId, reason, comments, currentDate, currentTime);
	})()
});

/** Send payment to payments database */
app.post("/send-payment", async (req: Request, res: Response) => {
	(async () => {
		let riderEmail = req.body.riderEmail;
		let driverPayPalEmail = req.body.driverPayPalEmail; /** @TODO Replace value with actual driver email ID */
		let rideCost = req.body.rideCost;
		let currentDate = new Date().toLocaleDateString();
		let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

		const dbPaymentPromise = await open({
			filename: './database/payments.sqlite',
			driver: sqlite3.Database
		})

		let driverEmail = "Test" /** @TODO Replace value with actual driver email ID */

		await dbPaymentPromise.run(`INSERT INTO Payments (rider_email, driver_email, ride_cost, payment_date, payment_time) VALUES (?,?,?,?,?)`, riderEmail, driverEmail, rideCost, currentDate, currentTime);

		/* delete duplicate records from the table */
		await dbPaymentPromise.run(`DELETE FROM Payments WHERE payment_id NOT IN (SELECT MIN(payment_id) FROM Payments GROUP BY rider_email, driver_email, ride_cost, payment_date, payment_time)`);
	})()
});

app.get("/ride-history", async (req: Request, res: Response) => {
	(async () => {
		let accountEmail = req.query.accountEmail;

		const dbGetRideHistoryPromise = await open({
			filename: './database/ridehistory.sqlite',
			driver: sqlite3.Database
		})

		let getRiderHistoryResults = await dbGetRideHistoryPromise.all(`SELECT RideHistory_ID, Driver_FirstName, Driver_LastName, Pickup_Time, Dropoff_Location, Ride_Date, Cost, Given_Rider_Rating FROM HISTORY WHERE Rider_ID='${accountEmail}'`)
		let getDriverHistoryResults = await dbGetRideHistoryPromise.all(`SELECT RideHistory_ID, Rider_FirstName, Rider_LastName, Ride_Date, Pickup_Time, Dropoff_Location, Earned, Given_Driver_Rating FROM HISTORY WHERE Driver_ID='${accountEmail}'`);

		res.json({
			ridersHistoryList: getRiderHistoryResults,
			driversHistoryList: getDriverHistoryResults
		});
	})()
})

app.get("/available-drivers", async (req: Request, res: Response) => {
	(async () => {
		let riderEmail = req.query.riderEmail;

		const [dbGetFavoriteDriversPromise, dbAvailableDriversPromise, dbBlockedDriversPromise] = await Promise.all([
			open({
				filename: './database/favorites.sqlite',
				driver: sqlite3.Database
			}),
			open({
				filename: './database/user_info.db',
				driver: sqlite3.Database
			}),
			open({
				filename: './database/blocked.sqlite',
				driver: sqlite3.Database
			}),
		])

		// Make rider status set to false
		await dbAvailableDriversPromise.run(`UPDATE USER_INFO SET Status_User = 'FALSE' WHERE Email = '${riderEmail}'`);

		let getFavoriteDriversListResults = await dbGetFavoriteDriversPromise.all(`SELECT Driver_Email FROM Favorites WHERE Rider_Email = '${riderEmail}'`);
		let getAvailableDriversListResults = await dbAvailableDriversPromise.all(`SELECT * FROM USER_INFO WHERE Type_User IN (2, 3) AND Status_User = 'TRUE'`);
		let getBlockedDriversListResults = await dbBlockedDriversPromise.all(`SELECT * FROM BLOCKED WHERE rider_id = '${riderEmail}'`);

		// List of available favorite drivers
		let availableFavoriteDrivers = getFavoriteDriversListResults
			.filter((favorite: { Driver_Email: string; }) => {
				return getAvailableDriversListResults.some((driver: { Email: string; }) => driver.Email === favorite.Driver_Email);
			})
			.map((favorite: { Driver_Email: string; }) => {
				const driverInfo = getAvailableDriversListResults.find((driver: { Email: string; }) => driver.Email === favorite.Driver_Email);
				if (driverInfo) {
					return {
						email: favorite.Driver_Email,
						first_name: driverInfo.First_Name,
						last_name: driverInfo.Last_Name
					} as { email: string; first_name: string; last_name: string };
				} else {
					console.error(`Driver info not found for email: ${favorite.Driver_Email}`);
					return null;
				}
			})
			.filter((favorite: { email: string; first_name: string; last_name: string; } | null): favorite is { email: string; first_name: string; last_name: string } => favorite !== null); // Adjusted filter to ensure proper type

		// List of other available drivers (excluding rider's blocked drivers)
		let blockedDrivers = getBlockedDriversListResults.map((blocked: { driver_id: string; }) => blocked.driver_id);
		let otherAvailableDrivers = getAvailableDriversListResults
			.filter((driver: { Email: string; }) => {
				return !blockedDrivers.includes(driver.Email);
			})
			.filter((driver: { Email: string; }) => {
				return !availableFavoriteDrivers.some((favorite: { email: string; }) => favorite && favorite.email === driver.Email);
			});

		/** @TODO Drivers who blocked the rider should not show */

		res.json({
			availableFavoriteDrivers: availableFavoriteDrivers,
			otherAvailableDrivers: otherAvailableDrivers
		});
	})()
});

app.post("/ride-queue", async (req: Request, res: Response) => {
	let rider_id = req.body.rider_id;
	let pickupLocation = req.body.pickupLocation;
	let dropoffLocation = req.body.dropoffLocation;

	const dbRideQueuePromise = sqlite.open({
		filename: "./database/ride_queue.sqlite",
		driver: sqlite3.Database
	});
	let rideQueue = await dbRideQueuePromise;

	/** @TODO Need to store rider's first and last name as well */
	await rideQueue.run(`INSERT INTO Ride_Queue (Rider_ID, Pickup, Dropoff) VALUES (?,?,?)`, rider_id, pickupLocation, dropoffLocation);
});

app.get("/ride-queue", async (req: Request, res: Response) => {
	let accountEmail = req.query.accountEmail;

	const dbGetRideQueuePromise = sqlite.open({
		filename: "./database/ride_queue.sqlite",
		driver: sqlite3.Database
	});
	let getRideQueue = await dbGetRideQueuePromise;

	let allRequestsList = await getRideQueue.all(`SELECT * FROM Ride_Queue`)
	/** @TODO Need to show riders who request specific driver */

	res.json({
		// pendingRequestsList: allPendingRequestsList,
		allRequestsList: allRequestsList,
	});
})

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});