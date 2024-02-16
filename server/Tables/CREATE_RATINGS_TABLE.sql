CREATE TABLE "RATINGS" (
	"Rating_ID"	INTEGER UNIQUE,
	"Rater_ID"	TEXT,
	"Ratee_ID"	TEXT,
	"Ratee_FirstName"	TEXT,
	"Ratee_LastName"	TEXT,
	"Star_Rating"	NUMERIC,
	"Comments"	TEXT,
	"Date"	TEXT,
	"Time"	TEXT,
	PRIMARY KEY("Rating_ID" AUTOINCREMENT)
)