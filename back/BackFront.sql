create database BackFront;

use BackFront;

CREATE TABLE
	user_data (
		id int identity (1, 1) not null,
		firstName varchar(80),
		lastName varchar(100),
		userName nvarchar (100),
		email nvarchar (150),
		passwordHash nvarchar (255) NOT NULL,
		userRole nvarchar (80),
		isActive int not null,
		createdAt datetime default getdate (),
		updatedAt DATETIME NULL,
		primary key (id)
	);

CREATE TABLE
	task_data (
		id INT IDENTITY (1, 1) NOT NULL,
		title NVARCHAR (MAX) NOT NULL,
		description TEXT NULL,
		status NVARCHAR (50) DEFAULT 'pending',
		priority NVARCHAR (50) DEFAULT 'medium',
		userId INT NOT NULL,
		createdAt DATETIME DEFAULT GETDATE (),
		updatedAt DATETIME NULL,
		isActive BIT DEFAULT 1,
		CONSTRAINT PK_task_data PRIMARY KEY (id),
		CONSTRAINT FK_task_user FOREIGN KEY (userId) REFERENCES user_data (id) ON DELETE CASCADE
	);

select
	*
from
	user_data