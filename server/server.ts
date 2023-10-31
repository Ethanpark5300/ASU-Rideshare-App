//it works but i don't know how to fix the error it's showing on require
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/message", (req:any, res:any) => {
	
	res.json({
		message: "Hello from server!",
		haha: req.request
	});
});


app.post("/registration", (req: any, res: any) => {
	console.log(req.body.user);
	res.json({
		registrationSuccess: true,
	});
});
const PORT = 3001
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});