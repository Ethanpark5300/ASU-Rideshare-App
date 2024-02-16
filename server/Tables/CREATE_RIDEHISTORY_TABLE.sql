CREATE TABLE "RIDE_HISTORY" (
	"RideHistory_ID"	INTEGER,
	"Rider_ID"	TEXT,
	"Rider_FirstName"	TEXT,
	"Rider_LastName"	TEXT,
	"Driver_ID"	TEXT,
	"Driver_FirstName"	TEXT,
	"Driver_LastName"	TEXT,
	"Pickup_Time"	TEXT,
	"Dropoff_Location"	TEXT,
	"Ride_Date"	TEXT,
	"Cost"	TEXT,
	"Earned"	TEXT,
	"Given_Rider_Rating"	INTEGER,
	"Given_Driver_Rating"	INTEGER,
	PRIMARY KEY("RideHistory_ID" AUTOINCREMENT)
)