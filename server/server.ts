const fs = require("fs");
const sqlite3= require ("sqlite3");
const express = require("express");
const cors = require("cors");
const app = express();
const Database = sqlite3.Database;


const PORT = process.env.PORT || 3001

let message: string | undefined;
let hadError: boolean;
app.use(cors());
app.use(express.json());


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
	const existing_user = user_info.prepare(fs.readFileSync(__dirname + '/Tables/login.sql').toString())
	existing_user.run([req.body.email, req.body.password], cb);
	res.json({
		registrationSuccess: !hadError,
		message: message,
	});
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