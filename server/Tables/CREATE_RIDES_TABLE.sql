CREATE TABLE "RIDES" (
	"Ride_ID"	INTEGER,
	"Rider_ID"	TEXT,
	"Driver_ID"	TEXT,
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