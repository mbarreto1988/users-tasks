create database BackFront;

use BackFront;

CREATE TABLE user_data(
	id int identity(1,1) not null,
	firstName varchar(80),
	lastName varchar(100),
	userName nvarchar(100),
	email nvarchar(150),
	passwordHash nvarchar(255) NOT NULL,
	userRole nvarchar(80),
	isActive int not null,
	createdAt datetime default getdate(),
	updatedAt DATETIME NULL,
	primary key(id)
);

select * from user_data