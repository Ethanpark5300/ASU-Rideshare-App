CREATE TABLE "RIDES" (
	"Ride_ID"	INTEGER,
	"Rider_ID"	TEXT,
	"Rider_FirstName"	TEXT,
	"Rider_LastName"	TEXT,
	"Driver_ID"	TEXT,
	"Driver_FirstName"	TEXT,
	"Driver_LastName"	TEXT,
	"Pickup_Location"	TEXT,
	"Pickup_Time"	TEXT,
	"Dropoff_Location"	TEXT,
	"Dropoff_Time"	TEXT,
	"Ride_Cost"	NUMERIC,
	"Given_Rider_Rating"	TEXT,
	"Given_Driver_Rating"	TEXT,
	"Ride_Date"	TEXT,
	"Status"	TEXT,
	PRIMARY KEY("Ride_ID" AUTOINCREMENT)
)