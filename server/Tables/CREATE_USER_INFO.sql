--Use IDENTITY(0,1) if AUTO_INCREMENT does not work
CREATE TABLE USER_INFO (
	 Email varchar(500) NOT NULL UNIQUE PRIMARY KEY,
	Type int,
    First_Name varchar(500) NOT NULL,
    Last_Name varchar(500) NOT NULL,
    Password varchar(500) NOT NULL,
    Rating_Passenger real,
    Rating_Driver real,
	Birthday date,
	Phone_Number varchar(500),
	Pay_Pal varchar(500), 
	Session_Token varchar(500),
	Status varchar(500)
);


