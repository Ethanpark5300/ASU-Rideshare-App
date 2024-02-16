CREATE TABLE "RIDE_QUEUE" (
	"RideQueue_ID"	INTEGER,
	"Rider_ID"	TEXT,
	"Rider_FirstName"	TEXT,
	"Rider_LastName"	TEXT,
	"Pickup_Location"	TEXT,
	"Dropoff_Location"	TEXT,
	"Status"	TEXT,
	PRIMARY KEY("RideQueue_ID" AUTOINCREMENT)
)