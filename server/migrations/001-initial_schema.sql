--Use IDENTITY(0,1) if AUTO_INCREMENT does not work
CREATE TABLE USER_INFO (
	User_ID int IDENTITY(0,1) PRIMARY KEY,
    First_Name varchar(500) NOT NULL,
    Last_Name varchar(500) NOT NULL,
    Username varchar(500) NOT NULL ,
    Password varchar(500) NOT NULL,
    Email varchar(500) NOT NULL,
    Rating_Passenger real,
    Rating_Driver real
);


