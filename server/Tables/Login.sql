-- <> = placeholder for actual username and password
--SELECT Email,Password,
--CASE
	--WHEN Email != '<Email>' OR Password != '<Password>' THEN 'The username or password is incorrect'
	--ELSE 'Successful'
--END
--FROM USER_INFO;
SELECT Email, First_Name, Last_Name, Password_User, Phone_Number, Type_User, Pay_Pal, Status_User FROM USER_INFO
WHERE Email = ?;-- AND Password = ?;