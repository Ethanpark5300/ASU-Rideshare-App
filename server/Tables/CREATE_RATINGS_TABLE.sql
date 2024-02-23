CREATE TABLE "RATINGS" (
	"Rating_ID"	INTEGER,
	"Rater_ID"	TEXT,
	"Ratee_ID"	TEXT,
	"Star_Rating"	NUMERIC,
	"Comments"	TEXT,
	"Date"	TEXT,
	"Time"	TEXT,
	PRIMARY KEY("Rating_ID" AUTOINCREMENT)
)