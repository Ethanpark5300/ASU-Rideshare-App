import 'dotenv/config'; //THIS GOES FIRST
import nodemailer from 'nodemailer';
import fs from 'fs';
import { Database } from 'sqlite3';
import express from 'express';
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import cors from "cors";
const app = express();
import cookieParser from 'cookie-parser';


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

/**
 * the email details to be used for sending emails
 */
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
 * @returns string error message, if one occurred, and undefined otherwise
 */
const sendRegisterVerifyEmail = (email: string, verifyID: string): string|undefined => {
	const mailOptions = {
		from: process.env.EMAIL_USERNAME,
		to: email,
		subject: "Email Verification",
		text: "This email was recently used in registration. Enter this the following to verify your email:\n" + verifyID + "\n\n If this wasn't you, ignore this email.",
	}
	message = undefined;
	transporter.sendMail(mailOptions, (err: Error | null, info: SMTPTransport.SentMessageInfo) => {
		if (err) {
			console.error(err.message);
			message = err.message;
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
	return message;
}
/**
 * 
 * @param email email to send to
 * @param verifyID unique generated ID that is sent in the content of the email
 * @param newPassword new randomly generated password given to the user
 * @returns string error message, if one occurred, and undefined otherwise
 */
const sendPasswordVerifyEmail = (email: string,  newPassword: string): string | undefined => {
	const mailOptions = {
		from: process.env.EMAIL_USERNAME,
		to: email,
		subject: "Password Change",
		text: "This email recently asked to change password. Here is a new temporary password:\n" + newPassword 
	}
	message = undefined;
	transporter.sendMail(mailOptions, (err: Error | null, info: SMTPTransport.SentMessageInfo) => {
		if (err) {
			console.error(err.message);
			message = err.message;
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
	return message;
}
/**
 * 
 * @param length length of the generated password
 * @returns new random password for user to use
 */
function createNewPassword(length: number): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let password = '';
	for (let i = 0; i < length; i++) {
		password += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return password;
}

/**
 * this generates a new password and emails the account with it
 * @param req.body.email account email
 * @returns passwordSuccess: bool if the operation succeeded, message:string|undefined error message if one occurred
 */
app.post("/password_request", async (req: Request, res: Response) => {
	let newPassword: string = createNewPassword(10);
	const salt: string = await bcrypt.genSalt(saltRounds);
	const hashedPassword: string = await bcrypt.hash(newPassword, salt)

	database.get("SELECT 1 FROM USER_INFO WHERE Email = ?", [req.body.email], (err: Error, userExist: any) => {
		if (userExist) {
			database.run('UPDATE USER_INFO SET Password = ? WHERE Email = ?', [hashedPassword, req.body.email], (err: Error, rows: Object) => {
				if (err) {
					hadError = true;
					message = err.message;
				} else {
					hadError = false;
					message = undefined;
				}
				message = sendPasswordVerifyEmail(req.body.email, hashedPassword);
				res.json({
					passwordSuccess: !hadError,
					message: message,
				});
			});
		}
		else {
			res.json({
				passwordSuccess: false,
				message: "User does not exist!",
			});
		}
	});
});
/**
 * this adds prospective user to register table and sends prospective user a verification string by email
 * @param req.body.email prospective user email
 * @param req.body.firstName first name given
 * @param req.body.lastName last name given
 * @param req.body.password prospective user password
 * @returns registrationSuccess: bool if the operation succeeded, message: string|undefined error message if one occurred
 */
app.post("/registration", async (req: Request, res: Response) => {
	if (!req.body.email.endsWith("@asu.edu")) {
		res.json({
			registrationSuccess: false,
			message: "Email is not an ASU email!",
		});
		return;
	}
	const salt: string = await bcrypt.genSalt(saltRounds);
	const hashedPassword: string = await bcrypt.hash(req.body.password, salt)

	database.get("SELECT 1 FROM USER_INFO WHERE Email = ?", [req.body.email], (err:Error, userExist:any) => {
		if (userExist) {
			res.json({
				registrationSuccess: false,
				message: "User already exists!",
			})
		} else {
			let UUID: string = generateRegisterID();

			database.run('INSERT OR REPLACE INTO REGISTER (First_Name, Last_Name, Password_User, Email, Register_ID) VALUES(?,?,?,?,?)', [req.body.firstName, req.body.lastName, hashedPassword, req.body.email, UUID], (err: Error, rows: Object) => {
				if (err) {
					hadError = true;
					message = err.message;
				} else {
					hadError = false;
					message = undefined;

					setVerifyCookie(res, req.body.email);
					message = sendRegisterVerifyEmail(req.body.email, UUID);
					if (message != undefined) {
						hadError = true;
					}
				}

				res.json({
					registrationSuccess: !hadError,
					message: message,
				});
			});
		}
	});
});
/**
 * changes a user's password
 * @param req.body.givenPassword the current password
 * @param req.body.newPassword the new password to change to
 * @param req.body.email the email of the account
 * @returns passwordSuccess: bool if the operation succeeded, message: string|undefined error message if one occurred
 */
app.post("/change_password", async (req: Request, res: Response) => {
	const emailPassWrong: string = "Email or Password is incorrect";
	database.run('SELECT Email, Password FROM USER_INFO WHERE Email = ? ', [req.body.email], (err: Error, rows: any) => {
		if (rows === undefined) {
			hadError = true; message = emailPassWrong;
		} else if (err) {
			hadError = true; message = err.message;
		} else {
			hadError = false;
			message = undefined;
		}


		if (!hadError) {

			bcrypt
				.compare(req.body.givenPassword, rows.Password_User)
				.then(result => {					
					if (result) {
						database.run('UPDATE USER_INFO SET Password = ? WHERE Email = ?', [req.body.newPassword, req.body.email], (err: Error, rows: Object) => {
							if (err) {
								hadError = true;
								message = err.message;
							} else {
								hadError = false;
								message = undefined;
							}
							res.json({
								passwordSuccess: !hadError,
								message: message,
							});
						});
					} else {
						hadError = true;
						message = emailPassWrong;
					}
					res.json({

						passwordSuccess: !hadError,
						message: message,
						
					});

				})
				.catch(err => { hadError = true; message = err.message; });
		} else {
			res.json({

				passwordSuccess: !hadError,
				message: message,
				
			});
		}
		
	});
});

/**
 * this sends a new email with a new verify string
 * @param req.body.email email to resend verify string to
 * @returns registrationSuccess: bool if the operation succeeded, message: string|undefined error message if one occurred
 */
app.post("/resend_verification", async (req: Request, res: Response) => {
	let UUID: string = generateRegisterID();

	database.run('UPDATE REGISTER SET Register_ID = ? WHERE Email = ?', [UUID, req.body.email], (err: Error, rows: Object) => {
		if (err) {
			hadError = true;
			message = err.message;
		} else {
			hadError = false;
			message = undefined;
		}

		setVerifyCookie(res, req.body.email);
		sendRegisterVerifyEmail(req.body.email, UUID);
		res.json({
			registrationSuccess: !hadError,
			message: message,
		});
	});
});

/**
 * @param req.bbody.register_ID verify string inputted by user
 * @returns registrationSuccess:bool if the operation succeeded, message:string|undefined error message if one occurred
 */
app.post("/registration_verification", (req: Request, res: Response) => {
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
		if (hadError) {
			res.json({
				registrationSuccess: false,
				message: message,
			});
			return;
		}

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
 * logs in a user and makes a session token
 * @param req.body.email user email
 * @param req.body.password user password
 */
app.post("/login", (req: Request, res: Response) => {
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
			bcrypt
				.compare(req.body.password, rows.Password_User)
				.then(result => {
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
});
/**
 * reads cookie from signedCookies and if it is valid returns the associated account information
 * used for maintaining login session
 * @returns user info
 */
app.get('/read-cookie', (req: Request, res: Response) => {
	//cookie should store something and we can get the user info afterwards

	const verifyAcc: Object | undefined = verifyToken(req.signedCookies.sessionToken);
	//return null for json to not throw out errors on the client side
	res.json(verifyAcc ?? null);
});
/**
 * logout and clear session token
 */
app.get('/clear-cookie', async (req: Request, res: Response) => {
	let db = await dbPromise;
	let user = req.query.userEmail;

	//Set user status to 'Offline'
	await db.run(`UPDATE USER_INFO SET Status_User = 'Offline' WHERE Email = '${user}'`);
	
	res.clearCookie('sessionToken').end();
});

/**
 * returns an object to be put in account: object returned
 * @param rows returned rows from some sql statement
 * @returns account object
 */
function accountObject(rows: any) {
	return {
		Email: rows?.Email ?? undefined,
		FirstName: rows?.First_Name ?? undefined,
		LastName: rows?.Last_Name ?? undefined,
		PhoneNumber: rows?.Phone_Number ?? undefined,
		AccountType: rows?.Type_User ?? 0,
		PayPalEmail: rows?.Pay_Pal ?? undefined,
		Status: rows?.Status_User ?? undefined
	};
}

/**
 * res should be passed by reference, and modified here to give a cookie to it
 * @param res response to have session token cookie added to
 * @param accObj account to be associated with session token
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

/**
 * res should be passed by reference, and modified here to give a cookie to it
 * @param res response to have verify cookie added to
 * @param email email assosiated with verify cookie
 */
function setVerifyCookie(res: Response, email: string) {
	const options = {
		httpOnly: true,
		signed: true,
		sameSite: 'lax' as const,
		maxAge: 5 * 60 * 1000, //5 minutes
	};

	res.cookie('registerCookie', email, options);
}

/**
 * generates a verify string using capital letters and numbers
 * @returns verify string
 */
function generateRegisterID(): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let ID = '';
	for (let i = 0; i < length; i++) {
		ID += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return ID;
}

/**
 * Verifies the session token is proper. Returned value can be used as true on success, false on error
 * @param token session token
 * @returns object with account details if validated, and undefined if error
 */
const verifyToken = function (token: string): Object | undefined {
	try {
		return jwt.verify(token, JWT_SECRET);
	} catch (e) {
		return undefined;
	}

}

/**
 *  Send block info to the blocked database
 * @param req.body.blocker the user email blocking
 * @param req.body.blockee the user email getting blocked
 */
app.post("/send-blocked", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let blocker_ID = req.body.blocker;
	let blockee_ID = req.body.blockee;
	let currentDate = new Date().toLocaleDateString();
	let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	
	await db.run('INSERT INTO BLOCKED (Blocker_ID, Blockee_ID, Date, Time) VALUES (?,?,?,?)', blocker_ID, blockee_ID, currentDate, currentTime);
});

/**
 * @param req.query.userid user email 
 * @returns blocked list for specific user 
 */
app.get("/get-blocked-list", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let userid = req.query.userid;

	let getBlockedList = await db.all(`SELECT blocked.blocked_id, blocked.blockee_id, user_info.first_name, user_info.last_name, blocked.date FROM user_info INNER JOIN blocked ON user_info.email = blocked.blockee_id WHERE blocked.blocker_id = '${userid}'`);

	res.json({
		blockedList: getBlockedList,
	});
});

/** 
 * Unblocking users for specific user 
 * @param req.body.userid email
 * @param req.body.selectedUser email of blockee
 * @returns updated blocked list for user
 */
app.post("/unblock-user", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let userid = req.body.userid;
	let selectedUser = req.body.selectedUser;

	await db.run(`DELETE FROM blocked WHERE blocker_id = '${userid}' AND blockee_id = '${selectedUser}'`);

	let getBlockedList = await db.all(`SELECT blocked.blocked_id, blocked.blockee_id, user_info.first_name, user_info.last_name, blocked.date FROM user_info INNER JOIN blocked ON user_info.email = blocked.blockee_id WHERE blocked.blocker_id = '${userid}'`);

	res.json({
		blockedList: getBlockedList,
	});
});

/** 
 * Insert ratings to ratings table and calculate/update average ratings 
 * @param req.body.rater user email for rater
 * @param req.body.ratee
 * @param req.body.star_rating rating
 * @param req.body.comments rater comments
 * @param req.body.favorited_driver bool if rater favorited ratee
 */
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

	/** Insert ratings to ratings table */
	await db.run('INSERT INTO RATINGS (Rater_ID, Ratee_ID, Star_Rating, Comments, Date, Time) VALUES (?,?,?,?,?,?)', rater_ID, ratee_ID, star_rating, comments, currentDate, currentTime);

	/** Calculate and update rider's average rating  */
	if (rateeUserType.Type_User === 1) {
		let defaultRating = await db.get(`SELECT Rating_Passenger FROM USER_INFO WHERE Email = '${ratee_ID}'`);
		let ratings = await db.all(`SELECT Star_Rating FROM RATINGS WHERE Ratee_ID = '${ratee_ID}'`);
		let totalRating = 0;

		for (let i = 0; i < ratings.length; i++) {
			totalRating += ratings[i].Star_Rating;
		}

		let updatedAvgRating = (defaultRating.Rating_Passenger * ratings.length + star_rating) / (ratings.length + 1);
		await db.run(`UPDATE USER_INFO SET Rating_Passenger = ? WHERE Email = ?`, updatedAvgRating, ratee_ID);
	} 
	else { /** Calculate and update driver's average rating */
		let defaultRating = await db.get(`SELECT Rating_Driver FROM USER_INFO WHERE Email = '${ratee_ID}'`);
		let ratings = await db.all(`SELECT Star_Rating FROM RATINGS WHERE Ratee_ID = '${ratee_ID}'`);
		let totalRating = 0;

		for (let i = 0; i < ratings.length; i++) {
			totalRating += ratings[i].Star_Rating;
		}

		let updatedAvgRating = (defaultRating.Rating_Driver * ratings.length + star_rating) / (ratings.length + 1);
		await db.run(`UPDATE USER_INFO SET Rating_Driver = ? WHERE Email = ?`, updatedAvgRating, ratee_ID);

		/** Send favorite request to specific driver if favoriteDriverRequest returns true */
		if (favoriteDriverRequest) await db.run(`INSERT INTO favorites (rider_id, driver_id, date, status) VALUES (?,?,?,?)`, rater_ID, ratee_ID, currentDate, "Pending");
	}
});

/**
 * @param req.query.userid user email to fetch favorites for
 * @returns getRidersFavoritesList rider's favorites and pending favorites list
 * @returns getDriversPendingFavoritesList driver's pending favorites list
 */
app.get("/get-favorites-list", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let userid = req.query.userid;

	let setRidersFavoritesList = await db.all(`SELECT favorites.favorite_id, favorites.driver_id, user_info.first_name, user_info.last_name, favorites.status, favorites.date FROM user_info INNER JOIN favorites ON user_info.email = favorites.driver_id WHERE favorites.rider_id = '${userid}'`);
	let setDriversPendingFavoritesList = await db.all(`SELECT favorites.favorite_id, favorites.rider_id, user_info.first_name, user_info.last_name, favorites.date FROM user_info INNER JOIN favorites ON user_info.email = favorites.rider_id WHERE status = "Pending" AND favorites.driver_id = '${userid}'`);

	res.json ({
		getRidersFavoritesList: setRidersFavoritesList,
		getDriversPendingFavoritesList: setDriversPendingFavoritesList
	});
});

/** 
 * Unfavorite driver 
 * @param req.body.riderid rider email
 * @param req.body.selectedDriver driver email
 * @returns getRidersFavoritesList updated list of favorites
 */
app.post("/unfavorite-driver", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderid = req.body.riderid;
	let driverid = req.body.selectedDriver;
	
	await db.run(`DELETE FROM favorites WHERE rider_id = '${riderid}' AND driver_id = '${driverid}'`);

	let setRidersFavoritesList = await db.all(`SELECT favorites.favorite_id, favorites.driver_id, user_info.first_name, user_info.last_name, favorites.status, favorites.date FROM user_info INNER JOIN favorites ON user_info.email = favorites.driver_id WHERE favorites.rider_id = '${riderid}'`);

	res.json ({
		getRidersFavoritesList: setRidersFavoritesList,
	});
});

/** 
 * Accept rider favorite request 
 * @param req.body.driverid driver email
 * @param req.body.riderid rider email
 * @returns getDriversPendingFavoritesList
 */
app.post("/accept-favorite-request", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let driverid = req.body.driverid;
	let riderid = req.body.riderid;

	await db.run(`UPDATE favorites SET status = "Favorited" WHERE driver_id = '${driverid}' AND rider_id = '${riderid}'`);

	let setDriversPendingFavoritesList = await db.all(`SELECT favorites.favorite_id, favorites.rider_id, user_info.first_name, user_info.last_name, favorites.date FROM user_info INNER JOIN favorites ON user_info.email = favorites.rider_id WHERE status = "Pending" AND favorites.driver_id = '${driverid}'`);

	res.json({
		getDriversPendingFavoritesList: setDriversPendingFavoritesList
	});
});

/** 
 * Decline rider favorite request 
 * @param req.body.driverid driver email
 * @param req.body.riderid rider email
 * @returns getDriversPendingFavoritesList
 */
app.post("/decline-favorite-request", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let driverid = req.body.driverid;
	let riderid = req.body.riderid;

	await db.run(`DELETE FROM favorites WHERE driver_id = '${driverid}' AND rider_id = '${riderid}'`);

	let setDriversPendingFavoritesList = await db.all(`SELECT favorites.favorite_id, favorites.rider_id, user_info.first_name, user_info.last_name, favorites.date FROM user_info INNER JOIN favorites ON user_info.email = favorites.rider_id WHERE status = "Pending" AND favorites.driver_id = '${driverid}'`);

	res.json({
		getDriversPendingFavoritesList: setDriversPendingFavoritesList
	});
});

/** 
 * Send report to reports database 
 * @param req.body.reporter reporter email
 * @param req.body.reportee reportee email
 * @param req.body.reason report reason
 * @param req.body.comments reporter comments
 */
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

/** 
 * Send payment to payments database 
 * @param req.body.Rider_ID rider email
 * @param req.body.Driver_ID driver email
 * @param req.body.rideCost ride cost
 */
app.post("/send-payment", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let rider_ID = req.body.Rider_ID;
	let driver_id = req.body.Driver_ID;
	let rideCost = req.body.rideCost;
	let currentDate = new Date().toLocaleDateString();
	let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	await db.run(`UPDATE rides SET status = "PAID" WHERE rider_id = '${rider_ID}' AND status = "PAYMENT"`)
	await db.run(`INSERT INTO PAYMENTS (Rider_ID, Driver_ID, Ride_Cost, Date, Time) VALUES (?,?,?,?,?)`, rider_ID, driver_id, rideCost, currentDate, currentTime);

	/* Delete duplicate records from the table */
	await db.run(`DELETE FROM PAYMENTS WHERE Payment_ID NOT IN (SELECT MIN(Payment_ID) FROM PAYMENTS GROUP BY Rider_ID, Driver_ID, Ride_Cost, Date, Time)`);
});

/** 
 * Update account information, but not payment information and update session token
 * @param req.body.userEmail user email
 * @param req.body.newFirstName updated first name
 * @param req.body.newLastName updated last name
 * @param req.body.newAccountType updated account type
 * @param req.body.newPhoneNumber updated phone number
 */
app.post("/edit-account", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let account = {
		Email: req.body.userEmail,
		FirstName: req.body.newFirstName,
		LastName: req.body.newLastName,
		AccountType: req.body.newAccountType,
		PhoneNumber: req.body.newPhoneNumber,
	};

	await db.run(`UPDATE USER_INFO SET First_Name = ?, Last_Name = ?, Type_User = ?, Phone_Number = ? WHERE Email = ?`, [account.FirstName, account.LastName, account.AccountType, account.PhoneNumber, account.Email]);
	setTokenCookie(res, account);
});

/** 
 * Update payment information and update session token
 * @param req.body.userEmail user email
 * @param req.body.newPayPalEmail new payment email
 */
app.post("/edit-payment-information", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let account = { 
		Email: req.body.userEmail,
		PayPalEmail: req.body.newPaypalEmail 
	}

	await db.run(`UPDATE user_info SET pay_pal = ? WHERE email = ?`, [account.PayPalEmail, account.Email]);
	setTokenCookie(res, account);
});

/** 
 * @returns account information 
 * @param req.query.accountEmail user email to view account for
 */
app.get("/view-account-info", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let userEmail = req.query.accountEmail;

	let account = await db.all(`SELECT * FROM USER_INFO WHERE Email = ?`, [userEmail]);

	res.json({
		account: account[0]
	});
});

/** 
 * Changes driver status to online/offline and update session token
 * @param req.body.userEmail user email
 * @param req.body.currentStatus current status(not the one to change to)
 */
app.post("/change-status", async (req: Request, res: Response) => {
	let db = await dbPromise;
	
	let account = {
		Email: req.body.userEmail,
		currentStatus: req.body.currentStatus
	}

	if (account.currentStatus === "Online") await db.run(`UPDATE USER_INFO SET Status_User = 'Offline' WHERE Email = '${account.Email}'`);
	else await db.run(`UPDATE USER_INFO SET Status_User = 'Online' WHERE Email = '${account.Email}'`);

	setTokenCookie(res, account);
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

/** Rider actions */

/** 
 * Sends ride information to ride queue table 
 * @param req.body.riderid rider email
 * @param req.body.pickupLocation pickup location
 * @param req.body.dropoffLocation destination
 * @param req.body.rideCost cost of ride
 */
app.post("/ride-queue", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderid = req.body.riderid;
	let pickupLocation = req.body.pickupLocation;
	let dropoffLocation = req.body.dropoffLocation;
	let rideCost = req.body.rideCost;
	let currentDate = new Date().toLocaleDateString();

	await db.run(`INSERT INTO RIDES (Rider_ID, Pickup_Location, Dropoff_Location, Ride_Cost, Ride_Date, Status) VALUES (?,?,?,?,?,?)`, riderid, pickupLocation, dropoffLocation, rideCost, currentDate, "QUEUED");
});

/** 
 * Riders cancelling from choose drivers page 
 * @param req.query.riderid rider email
 */
app.get("/cancel-request", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let rider_id = req.query.riderid;

	await db.run(`DELETE FROM RIDES WHERE Rider_ID = '${rider_id}' AND Status = "QUEUED"`);
	await db.run(`DELETE FROM PENDING_DRIVERS WHERE Rider_ID = '${rider_id}'`);
});

/** 
 * gets available drivers
 * @param req.query.riderid rider email
 * @returns availableFavoriteDrivers and otherAvaialableDrivers
 */
app.get("/available-drivers", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderEmail = req.query.riderid;

	// Get favorite drivers who are available and not blocked
	let getFavoriteDriversList = await db.all(`SELECT Driver_ID FROM FAVORITES WHERE status = "Favorited" AND Rider_ID = ?`, [riderEmail]);
	let favoriteDriverEmails = getFavoriteDriversList.map((driver: { Driver_ID: string; }) => driver.Driver_ID);

	let getBlockedDriversList = await db.all(`SELECT Blockee_ID FROM BLOCKED WHERE Blocker_ID = ?`, [riderEmail]);
	let blockedDriverEmails = getBlockedDriversList.map((driver: { Blockee_ID: string; }) => driver.Blockee_ID);

	let getBlockeeDriversList = await db.all(`SELECT Blocker_ID FROM BLOCKED WHERE Blockee_ID = ?`, [riderEmail]);
	let blockingDriverEmails = getBlockeeDriversList.map((driver: { Blocker_ID: string; }) => driver.Blocker_ID);

	// Combine both lists to create a list of all blocked drivers
	let excludedDriverEmails = [...blockedDriverEmails, ...blockingDriverEmails];

	// Filter available favorite drivers
	let availableFavoriteDrivers = await db.all(`SELECT Email, First_Name, Last_Name FROM USER_INFO WHERE Email IN (${favoriteDriverEmails.map(() => '?').join(', ')}) AND Type_User IN (2, 3) AND Status_User = 'Online'`, favoriteDriverEmails);

	// Filter other available drivers excluding favorite drivers and blocked drivers
	let otherAvailableDrivers = await db.all(`SELECT Email, First_Name, Last_Name FROM USER_INFO WHERE Type_User IN (2, 3) AND Status_User = 'Online' AND Email NOT IN (${[...favoriteDriverEmails, ...excludedDriverEmails].map(() => '?').join(', ')})`, [...favoriteDriverEmails, ...excludedDriverEmails]);

	res.json({
		availableFavoriteDrivers: availableFavoriteDrivers,
		otherAvailableDrivers: otherAvailableDrivers
	});
});

/** 
 * Request specific driver 
 * @param req.body.riderid rider email
 * @param req.body.driverid driver email
 * @returns pendingDriversList
 */
app.post("/request-driver", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderid = req.body.riderid;
	let driverid = req.body.driverid;

	// Insert the pending driver record into the PENDING_DRIVERS table
	await db.run(`INSERT INTO PENDING_DRIVERS (Rider_ID, Driver_ID) VALUES (?,?)`, riderid, driverid);

	// Retrieve the updated list of pending drivers
	let pendingDriversList = await db.all(`SELECT pending_drivers.driver_id, user_info.first_name, user_info.last_name FROM user_info INNER JOIN pending_drivers ON user_info.email = pending_drivers.driver_id`);

	res.json({
		pendingDriversList: pendingDriversList,
	});
});

/** 
 * Cancel request specific driver 
 * @param req.body.riderid rider email
 * @param req.body.driverid driver email
 * @returns cancelledDriver: string the cancelled drivers email
 */
app.post("/cancel-request-driver", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderid = req.body.riderid;
	let driverid = req.body.driverid;

	// Delete the pending driver record from the PENDING_DRIVERS table
	await db.run(`DELETE FROM pending_drivers WHERE rider_id = '${riderid}' AND Driver_ID = '${driverid}'`);
	
	res.json({
		cancelledDriver: driverid,
	});
});

/** 
 * Check if any driver accepted rider request 
 * @param req.query.riderid rider email
 * @returns recievedDriver: bool if accepted return true 
 */
app.get("/check-driver-accepted-status", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderid = req.query.riderid;

	/** Check if any driver accepted rider request */
	let checkDriverStatus = await db.get(`SELECT driver_id FROM rides WHERE rider_id = '${riderid}' AND status = "PAYMENT"`);
	
	// Driver accepted
	res.json({
		recievedDriver: (checkDriverStatus !== undefined), //return true if something was returned from database
	});
});

/** 
 * gets ride payment info
 * @param req.query.riderid rider email
 * @returns ride payment information to payment page 
 */
app.get("/get-ride-payment-information", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderid = req.query.riderid;

	let ridePaymentInformation = await db.get(`SELECT rides.driver_id, user_info.first_name, user_info.last_name, user_info.pay_pal, rides.ride_cost FROM user_info INNER JOIN rides WHERE rider_id = '${riderid}' AND status = "PAYMENT"`);
	if (ridePaymentInformation.length <= 0) return;

	res.json({
		ridePaymentInformation: ridePaymentInformation
	});
});

/**
 * Riders cancelling their ride on the payment page 
 * @param req.body.riderid rider email
 */
app.post("/cancel-ride-from-payment", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderid = req.body.riderid;

	await db.run(`UPDATE rides SET status = "CANCELLED(RIDER)" WHERE rider_id = '${riderid}' AND status = "PAYMENT"`);
});

/** 
 * Check if driver has arrived 
 * @param req.query.riderid rider email
 * @returns getDriverArrivedStatus
 */
app.get("/check-if-driver-arrived", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderid = req.query.riderid;

	let driverArrivedStatus = await db.all(`SELECT status FROM rides WHERE rider_id='${riderid}'`);
	if (driverArrivedStatus.length <= 0) return;

	let setDriverArrivedStatus = driverArrivedStatus[driverArrivedStatus.length - 1].Status;

	res.json({
		getDriverArrivedStatus: setDriverArrivedStatus
	});
});

app.get("/check-if-driver-started-ride", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderid = req.query.riderid;

	let driverStartedStatus = await db.all(`SELECT status FROM rides WHERE rider_id = '${riderid}'`);
	if (driverStartedStatus.length <= 0) return;

	let setDriverStartedStatus = driverStartedStatus[driverStartedStatus.length - 1].Status;

	res.json({
		getDriverStartedStatus : setDriverStartedStatus
	});
});

/** Driver actions */

/** 
 * get rider queue
 * @param req.query.driveremail driver email
 * @returns pendingRiderRequestsList, allRequestsList 
 */
app.get("/ride-queue", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let driverEmail = req.query.driveremail;

	// Get all ride requests with status "QUEUED"
	let getRidersRequests = await db.all(`SELECT rides.ride_id, rides.rider_id, user_info.first_name, user_info.last_name, rides.pickup_location, rides.dropoff_location FROM rides INNER JOIN user_info ON rides.rider_id = user_info.email WHERE rides.status = "QUEUED"`);

	// Get all riders who blocked the driver
	let getBlockedRiders = await db.all(`SELECT Blockee_ID FROM BLOCKED WHERE Blocker_ID = ?`, [driverEmail]);

	// Get all riders whom the driver blocked
	let getBlockeeRiders = await db.all(`SELECT Blocker_ID FROM BLOCKED WHERE Blockee_ID = ?`, [driverEmail]);

	// Combine both lists to create a list of all blocked riders
	let excludedRiderEmails = [...getBlockedRiders.map((rider: { Blockee_ID: string; }) => rider.Blockee_ID), ...getBlockeeRiders.map((rider: { Blocker_ID: string; }) => rider.Blocker_ID)];

	// Filter out blocked riders from all ride requests
	let allRequestsList = getRidersRequests.filter((request: { Rider_ID: string; }) => !excludedRiderEmails.includes(request.Rider_ID));

	// Get pending rider requests for the specific driver
	let getPendingRiderRequests = await db.all(`SELECT rides.ride_id, rides.rider_id, user_info.first_name, user_info.last_name, rides.pickup_location, rides.dropoff_location FROM pending_drivers INNER JOIN rides ON pending_drivers.rider_id = rides.rider_id INNER JOIN user_info ON rides.rider_id = user_info.email WHERE pending_drivers.driver_id = ${driverEmail} AND rides.status = "QUEUED"`);
	
	res.json({
		pendingRiderRequestsList: getPendingRiderRequests,
		allRequestsList: allRequestsList
	});
});

/** 
 * Driver accepting rider request 
 * @param req.body.driverid driver email
 * @param req.body.riderid rider email
 */
app.post("/accept-ride-request", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let driverid = req.body.driverid;
	let riderid = req.body.riderid;

	await db.run(`UPDATE rides SET driver_id = '${driverid}', status = "PAYMENT" WHERE rider_id = '${riderid}' AND Status = "QUEUED"`);
});

/** 
 * @param req.query.userid user email
 * @returns riderRideInfo, driverRideInfo
 */
app.get("/get-ride-information", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let userid = req.query.userid;

	let getRiderRideInfo = await db.get(`SELECT user_info.first_name, user_info.last_name, rides.pickup_location, rides.dropoff_location FROM rides INNER JOIN user_info ON rides.driver_id = user_info.email WHERE rides.rider_id = '${userid}' AND status = "PAID" OR status = "WAITING(DRIVER)" OR status = "ONGOING"`);
	let getDriverRideInfo = await db.get(`SELECT user_info.first_name, user_info.last_name, rides.pickup_location, rides.dropoff_location FROM rides INNER JOIN user_info ON rides.rider_id = user_info.email WHERE driver_id = '${userid}' AND status = "PAYMENT" OR status = "PAID" OR status = "WAITING(DRIVER)" OR status = "ONGOING"`);

	res.json({
		riderRideInfo: getRiderRideInfo,
		driverRideInfo: getDriverRideInfo,
	});
});

/** 
 * Check if rider payed driver 
 * @param req.query.driverid driver email
 * @returns rideStatus: string the current ride payment status
 */
app.get("/get-rider-payment-status", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let driverid = req.query.driverid;

	let ridePaymentStatus = await db.all(`SELECT status FROM rides WHERE driver_id = '${driverid}'`);
	if(ridePaymentStatus.length	<= 0) return

	let currentRideStatus = ridePaymentStatus[ridePaymentStatus.length - 1].Status;

	res.json({
		rideStatus: currentRideStatus,
	});
});

/** 
 * Cancelling ride 
 * @param req.body.userid user email
 * @param req.body.passedCancellation bool for cancellation passed deadline
 */
app.post("/cancel-ride", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let userid = req.body.userid;
	let passedCancellation: boolean = req.body.passedCancellation;
	
	try {
		let userType = await db.get(`SELECT type_user FROM user_info WHERE email = '${userid}'`);

		/** Rider cancelling before deadline */
		if (userType.Type_User === 1 && passedCancellation === false) {
			await db.run(`UPDATE rides SET status = "CANCELLED(RIDER)" WHERE rider_id = '${userid}' AND status = "PAID"`);
		}

		/** Rider cancelling after deadline */
		else if (userType.Type_User === 1 && passedCancellation === true) {
			await db.run(`UPDATE rides SET status = "CANCELLED(RIDER)" WHERE rider_id = '${userid}' AND status = "PAID" || status = "PAYMENT"`);

			let currentWarnings = await db.get(`SELECT warnings FROM user_info WHERE email = '${userid}'`);
			let newWarningsCount = currentWarnings.Warnings + 1;

			await db.get(`UPDATE user_info SET warnings = '${newWarningsCount}' WHERE email = '${userid}'`);
		}

		/** Driver cancelling before deadline */
		else if (userType.Type_User === 2 && passedCancellation === false) {
			await db.run(`UPDATE rides SET status = "CANCELLED(DRIVER)" WHERE driver_id = '${userid}' AND status = "PAID" OR status = "PAYMENT"`);
		}

		/** Driver cancelling after deadline */
		// else if (userType.Type_User === 2 && passedCancellation === true) {
		else {
			await db.run(`UPDATE rides SET status = "CANCELLED(DRIVER)" WHERE driver_id = '${userid}' AND status = "PAID" OR status = "PAYMENT"`);

			let currentWarnings = await db.get(`SELECT warnings FROM user_info WHERE email = '${userid}'`);
			let newWarningsCount = currentWarnings.Warnings + 1;

			await db.get(`UPDATE user_info SET warnings = '${newWarningsCount}' WHERE email = '${userid}'`);
		}
	} catch (error) {
		res.json({
			errorMessage : error
		})
	}
});

/** 
 * Check if driver cancelled ride 
 * @param req.query.riderid rider email
 * @returns getCancellationStatus
 */
app.get("/check-driver-cancellation-status", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let riderid = req.query.riderid;

	let cancellationStatus = await db.all(`SELECT status FROM rides WHERE rider_id='${riderid}'`);
	if (cancellationStatus.length <= 0) return;

	let setCheckCancellationStatus = cancellationStatus[cancellationStatus.length - 1].Status;

	res.json({
		getCancellationStatus : setCheckCancellationStatus
	});
});

/** 
 * Check if rider cancelled ride
 * @param req.query.driverid driver email
 * @returns getCancellationStatus
 */
app.get("/check-rider-cancellation-status", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let driverid = req.query.driverid;

	let cancellationStatus = await db.all(`SELECT status FROM rides WHERE driver_id='${driverid}'`);
	if (cancellationStatus.length <= 0) return;

	let setCheckCancellationStatus = cancellationStatus[cancellationStatus.length - 1].Status;

	res.json({
		getCancellationStatus : setCheckCancellationStatus
	});
});

/** 
 * Change status to waiting(driver) to show driver arrived
 * @param req.body.driverid driver email 
 */
app.post("/driver-arrived-pickup", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let driverid = req.body.driverid;

	await db.run(`UPDATE rides SET status = "WAITING(DRIVER)" WHERE driver_id = '${driverid}' AND status = "PAID"`);
});

/** 
 * Starting the ride 
 * @param req.body.driverid driver email
 * @param currentTime current time
 */
app.post("/start-ride", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let driverid = req.body.driverid;
	let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	await db.run(`UPDATE rides SET pickup_time = ?, status = ? WHERE driver_id = ? AND status = ?`, [currentTime, "ONGOING", driverid, "WAITING(DRIVER)"]);
});

/**
 * Ending the ride
 * @param req.body.driverid driver email
 * @param currentTime current time
 */
app.post("/end-ride", async (req: Request, res: Response) => {
	let db = await dbPromise;
	let driverid = req.body.driverid;
	let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	
	await db.run(`UPDATE rides SET dropoff_time = '${currentTime}', status = "COMPLETED" WHERE driver_id = '${driverid}' AND status = "ONGOING"`);
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});