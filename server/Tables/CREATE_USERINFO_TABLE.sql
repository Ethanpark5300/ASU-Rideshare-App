--Use IDENTITY(0,1) if AUTO_INCREMENT does not work
CREATE TABLE USER_INFO (
	 Email varchar(500) NOT NULL UNIQUE PRIMARY KEY,
	Type_User int,
    First_Name varchar(500) NOT NULL,
    Last_Name varchar(500) NOT NULL,
    Password_User varchar(500) NOT NULL,
    Rating_Passenger real,
    Rating_Driver real,
	Phone_Number varchar(500),
	Pay_Pal varchar(500), 
	Status_User varchar(500)
);


