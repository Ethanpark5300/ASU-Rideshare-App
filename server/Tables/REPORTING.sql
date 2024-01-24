--empty table right now until we confirm what exactly we want from this
CREATE TABLE REPORTING (
	USER_ID int,
	REPORT_ID int NOT NULL PRIMARY KEY, --actual report number 
	REPORTED_ID int, -- person getting reported user id
	REASON varchar(500)
)
