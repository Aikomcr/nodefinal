DROP DATABASE IF EXISTS `nodelogin`;
CREATE DATABASE IF NOT EXISTS `nodelogin`;
use `nodelogin`;

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `title` varchar(100) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `nom_producto` varchar(50) DEFAULT NULL,
  `tienda_prod` varchar(50) DEFAULT NULL,
  `precio_prod` int(11) DEFAULT NULL,
  `cantidad_prod` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

CREATE TABLE `users` (
  `email` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(123) DEFAULT 'usuClie',
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

INSERT INTO `users` VALUES('daniel@gmail.com','daniel','123','usuTienda');
INSERT INTO `users` VALUES('aiko@gmail.com','aiko','123','usuClie');
INSERT INTO `productos` VALUES(null,'leche','alqueria',30000,12);
