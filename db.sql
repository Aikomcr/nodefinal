CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `nodelogin`;

  CREATE TABLE IF NOT EXISTS `users` (
    `email` varchar(100) NOT NULL PRIMARY KEY,
    `name` varchar(50) NOT NULL,
    `password` varchar(255) NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS `tasks`(
  id int not null primary key auto_increment comment 'primary key',
  title VARCHAR(100),
  description varchar(255)
  ) default charset utf8 comment '';

insert into `users` values ('daniel@gmail.com','daniel','123');

select * from users;