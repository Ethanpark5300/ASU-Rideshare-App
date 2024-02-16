CREATE TABLE "PAYMENTS" (
	"Payment_ID"	INTEGER,
	"Rider_ID"	TEXT,
	"Driver_ID"	TEXT,
	"Ride_Cost"	NUMERIC,
	"Date"	TEXT,
	"Time"	TEXT,
	PRIMARY KEY("Payment_ID" AUTOINCREMENT)
)