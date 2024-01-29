/*table is for viewing all
will create a way to pull the information for specific drivers with a WHERE statement*/
CREATE TABLE DRIVER_REVIEW_PAGE (
	Email varchar(500) NOT NULL UNIQUE PRIMARY KEY,
	Rider_ID int NOT NULL,
	Rating int,
	Review varchar(500),
	Date_Submitted DATE
);
