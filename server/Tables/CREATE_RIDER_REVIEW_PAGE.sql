CREATE TABLE RIDER_REVIEW_PAGE (
	Email varchar(500) NOT NULL UNIQUE PRIMARY KEY,
	Driver_ID int NOT NULL,
	Rating int,
	Review varchar(500),
	Date_Submitted DATE
);
