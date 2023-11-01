/*When a person is creating a new account, it will check if account is created and create an account 
if there is no repeat
<> = placeholder for user input that will be filled in */
INSERT INTO USER_INFO (First_Name,Last_Name,Username,Password,Email)
SELECT '<First_Name>','<Last_Name>','<Username>','<Password>','<Email>'
WHERE NOT EXISTS (SELECT /*First_Name,Last_Name,Username,Password,*/Email FROM USER_INFO
WHERE First_Name ='<First_Name>'
AND Last_Name = '<Last_Name>'
AND Username = '<Username>'
AND Password = '<Password>'
AND Email = '<Email>');
