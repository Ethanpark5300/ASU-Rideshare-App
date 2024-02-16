CREATE TABLE "REPORTS" (
	"Report_ID"	INTEGER UNIQUE,
	"Reporter_ID"	TEXT,
	"Reportee_ID"	TEXT,
	"Reason"	TEXT,
	"Comments"	TEXT,
	"Date"	TEXT,
	"Time"	TEXT,
	PRIMARY KEY("Report_ID" AUTOINCREMENT)
)