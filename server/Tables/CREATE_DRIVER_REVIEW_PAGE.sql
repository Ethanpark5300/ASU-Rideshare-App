/*table is for viewing all
will create a way to pull the information for specific drivers with a WHERE statement*/
CREATE TABLE DRIVER_REVIEW_PAGE (
	User_ID int NOT NULL PRIMARY KEY,
	Rider_ID int NOT NULL,
	Rating int,
	Review varchar(500),
	Date_Submitted DATE
);
