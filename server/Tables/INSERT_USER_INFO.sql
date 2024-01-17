/*INSERT INTO USER_INFO
VALUES 
	(0,'zeal','smeal','zealsmeal','11111','zealsmeal@asu.edu',4.5,4.0),
	(1,'accidentally','demolish','accidentallydemolish','11112','accidentallydemolish@asu.edu',NULL,3.6),
	(2,'fictionalize','splatter','fictionalizesplatter','11113','fictionalizesplatter@asu.edu',2.2,2.4),
	(3,'propagandize','famously','propagandizefamously','11114','propagandizefamously@asu.edu',1.0,0.8),
	(4,'collectivize','provided','collectivizeprovided','11115','collectivizeprovided@asu.edu',3.8,3.5),
	(5,'hmincidentally','during','hmincidentallyduring','11116','hmincidentallyduring@asu.edu',2.8,2.8),
	(6,'pathogenesis','skeleton','pathogenesisskeleton','11117','pathogenesisskeleton@asu.edu',4.1,NULL),
	(7,'malnutrition','straddle','malnutritionstraddle','11118','malnutritionstraddle@asu.edu',4.2,3.2),
	(8,'aboutthan','accessorize','aboutthanaccessorize','11119','aboutthanaccessorize@asu.edu',1,NULL),
	(9,'conscientise','paginate','conscientisepaginate','11120','conscientisepaginate@asu.edu',0.1,0.4),
	(10,'howconserervation','never','howconservationnever','11121','howconservationnever@asu.edu',4.1,NULL),
	(11,'conventional','too','conventionaltoo','11122','conventionaltoo@asu.edu',1.5,3.6),
	(12,'underachieve','ack','underachieveack','11123','underachieveack@asu.edu',1.1,0.0),
	(13,'above','evangelize','aboveevangelize','11124','aboveevangelize@asu.edu',3.5,NULL),
	(14,'consequently','why','consequentlywhy','11125','consequentlywhy@asu.edu',NULL,4.6),
	(15,'hmp','hupliftingly','hmphupliftingly','11126','hmphupliftingly@asu.edu',4.7,3.4),
	(16,'over','exertionaha','overexertionaha','11127','overexertionaha@asu.edu',3.3,2.6),
	(17,'boohoo','treasured','boohootreasured','11128','boohootreasured@asu.edu',4.5,4.6),
	(18,'underneath','throughout','underneaththroughout','11129','underneaththroughout@asu.edu',2,1.2),
	(19,'mechanically','gah','mechanicallygah','11130','mechanicallygah@asu.edu',2,NULL),
	(20,'meaningfully','off','meaningfullyoff','11131','meaningfullyoff@asu.edu',NULL,4.8);
*/	
--assuming auto INCREMENT works then this should be code since we do not need to worry about User_id
INSERT INTO USER_INFO(First_Name,Last_Name,Password,Email,Rating_Passenger,Rating_Driver,Phone_Number)
VALUES 
	('zeal',				'smeal',		'$2a$10$U/4oET/nT6fzpOnB72oNCOXyEEQt2kwbK7/Drek3/4EpPIkSx6vHK','zealsmeal@asu.edu',4.5,4.0,'111-111-1111'),	--pass: 11111
	('accidentally',		'demolish',		'$2a$10$m1TLFSUBalwb7qXN4CJ7vee5a.rKvnXYjk6mJho1ZhpoUSI/QvNQS','accidentallydemolish@asu.edu',NULL,3.6,'111-111-1111'),	--pass: 11112
	('fictionalize',		'splatter',		'$2a$10$qCH0yEsvmMBYSddGxPh9k.Nr3L6MsRxxE2wXwSeuOrt0LxwCkcYl.','fictionalizesplatter@asu.edu',2.2,2.4,'111-111-1111'),	--pass: 11113
	('propagandize',		'famously',		'$2a$10$nWBf4CUB01c.6OZEV6hs4.wPrXwXDnzbNMttTbPU98lfgywTr/xby','propagandizefamously@asu.edu',1.0,0.8,'111-111-1111'),	--pass: 11114
	('collectivize',		'provided',		'$2a$10$knxMPd0T4LRQPvkh5SVEHO1N2oECo2V8.a1hYWKLYx9MBo2G.Iyb.','collectivizeprovided@asu.edu',3.8,3.5,'111-111-1111'),	--pass: 11115
	('hmincidentally',		'during',		'$2a$10$kKrQ9l2xInTYJW/IreOhXedu/Yzqo79PO1jMwTo4/Z08m0rFv0RVu','hmincidentallyduring@asu.edu',2.8,2.8,'111-111-1111'),	--pass: 11116
	('pathogenesis',		'skeleton',		'$2a$10$7jf9pP8Mse0V/D3R1Sw3E.ZvGJSVTaHC0Q8LVeXUOi69PRqMVdKOe','pathogenesisskeleton@asu.edu',4.1,NULL,'111-111-1111'),	--pass: 11117
	('malnutrition',		'straddle',		'$2a$10$KkIWQMTVjYobQBNuaNOBFOhJhtfDhlw0Nsi1Wi8qboP.moe0uNORa','malnutritionstraddle@asu.edu',4.2,3.2,'111-111-1111'),	--pass: 11118
	('aboutthan',			'accessorize',	'$2a$10$M6H5pfFXtm35GPTsIPFCzuqkL7Cif8yAduVU.6j8FnNgmuOLZfnQm','aboutthanaccessorize@asu.edu',1,NULL,'111-111-1111'),		--pass: 11119
	('conscientise',		'paginate',		'$2a$10$1TwmfYTeZB856leYPTBEU.OTjOQ5u2ZhH3/Zh8dDCSVCZvt3k3bdq','conscientisepaginate@asu.edu',0.1,0.4,'111-111-1111'),	--pass: 11120
	('howconserervation',	'never',		'$2a$10$x1Q5zfKbantHAgW66BEe3eMo/SvdcAeXr2jTr48bQ5G/DKB4Blw0y','howconservationnever@asu.edu',4.1,NULL,'111-111-1111'),	--pass: 11121
	('conventional',		'too',			'$2a$10$dnkdhaAXHjy2E6L9g64lGeMBu7Jz.r40kFZDWH3fARb6b.TWcJeaS','conventionaltoo@asu.edu',1.5,3.6,'111-111-1111'),			--pass: 11122
	('underachieve',		'ack',			'$2a$10$KymWX7pV0KCCVrBqT2GyfupsVaLrtKz6z7MxeUWD7sV7T075DeLmm','underachieveack@asu.edu',1.1,0.0,'111-111-1111'),			--pass: 11123
	('above',				'evangelize',	'$2a$10$DdC8FaCNb3PZCosF7g7RHOTRCZHiqBbU01wlV1SVfs7lhLJvbUvLq','aboveevangelize@asu.edu',3.5,NULL,'111-111-1111'),		--pass: 11124
	('consequently',		'why',			'$2a$10$tjWfo50QaD9maobMPTViN.AWTx298gaIT.8T.I4FR2xBO5a6K5Dnq','consequentlywhy@asu.edu',NULL,4.6,'111-111-1111'),		--pass: 11125
	('hmp',					'hupliftingly',	'$2a$10$cLG8lOZb387.u6ooWwjzLumofu97sMLEmPeSDve0na8eVG5mQVg12','hmphupliftingly@asu.edu',4.7,3.4,'111-111-1111'),			--pass: 11126
	('over',				'exertionaha',	'$2a$10$1s.tF2JG9QfXU//w0kay..Y2DCl255QSHtDvrKsNYGazoYMhGBFE2','overexertionaha@asu.edu',3.3,2.6,'111-111-1111'),			--pass: 11127
	('boohoo',				'treasured',	'$2a$10$E.7gdZl50wU70jp20qlnouOUCzJBqUc5tIc1kYtl5x40JzesgicZK','boohootreasured@asu.edu',4.5,4.6,'111-111-1111'),			--pass: 11128
	('underneath',			'throughout',	'$2a$10$GXBg9EZuvNtS90Wah2doqOCf5BotLENIDmh94Wi/qbq6XSd0AqDkC','underneaththroughout@asu.edu',2,1.2,'111-111-1111'),		--pass: 11129
	('mechanically',		'gah',			'$2a$10$J32fZ49e90rghVUFzZJ9cukiRsbGZWtLYhaCwVCeDQkkRtEw5W/Gm','mechanicallygah@asu.edu',2,NULL,'111-111-1111'),			--pass: 11130
	('meaningfully',		'off',			'$2a$10$qZX3SuGXU22L2Iq8pFScwOEadL2GK8IcFO2vBsy.LTj9quHoXl6lK','meaningfullyoff@asu.edu',NULL,4.8,'111-111-1111');		--pass: 11131
