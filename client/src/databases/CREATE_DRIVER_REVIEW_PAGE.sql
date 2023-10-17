CREATE TABLE DRIVER_REVIEW_PAGE (
	User_ID int NOT NULL PRIMARY KEY,
	Rider_ID int NOT NULL,
	Rating int,
	Review varchar(500),
	Date_Submitted DATE
);
