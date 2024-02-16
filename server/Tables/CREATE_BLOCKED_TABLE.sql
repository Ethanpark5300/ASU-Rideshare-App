CREATE TABLE "BLOCKED" (
	"Blocked_ID"	INTEGER UNIQUE,
	"Blocker_ID"	TEXT,
	"Blockee_ID"	TEXT,
	"Blockee_FirstName"	TEXT,
	"Blockee_LastName"	TEXT,
	"Date"	TEXT,
	"Time"	TEXT,
	PRIMARY KEY("Blocked_ID" AUTOINCREMENT)
)