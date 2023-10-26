-- <> = placeholder for actual username and password
SELECT Username,Password,
CASE
	WHEN Username != '<Username>' OR Password != '<Password>' THEN 'The username or password is incorrect'
	ELSE 'Successful'
FROM USER_INFO