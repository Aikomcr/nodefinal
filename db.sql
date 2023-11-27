DROP DATABASE `nodelogin1`;
CREATE DATABASE IF NOT EXISTS `nodelogin1`;
use `nodelogin1`;

CREATE TABLE `users` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(123) DEFAULT 'usuClie',
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

/* INSERT INTO `users` VALUES(null,'daniel@gmail.com','daniel','123','usuTienda');
INSERT INTO `users` VALUES(null,'aiko@gmail.com','aiko','123','usuClie');
*/
CREATE TABLE `tienda` (
  `idTienda` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `nombreTienda` varchar(50) NOT NULL,
  `descTienda` varchar(200) DEFAULT NULL,
  `categTienda` varchar(50) NOT NULL,
  PRIMARY KEY (`idTienda`),
  KEY `userId` (`userId`),
  CONSTRAINT `tienda_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'primary key',
  `nom_producto` varchar(50) DEFAULT NULL,
  `tienda_prod` int(11) DEFAULT NULL,
  `precio_prod` int(11) DEFAULT NULL,
  `cantidad_prod` int(11) DEFAULT NULL,
  `imagen_producto` varchar(200),
  PRIMARY KEY (`id`),
  KEY `tienda_prod` (`tienda_prod`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`tienda_prod`) REFERENCES `tienda` (`idTienda`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

/* INSERT INTO `tienda` values(1,1,'patitas','Tienda de comida para perros','Comida');
INSERT INTO `productos` VALUES(1,'leche',1,30000,12,'/img/perrosalchicha.jpg');
*/
INSERT INTO `productos` VALUES(3,'leche',1,30000,12,'/img/perrosalchicha.jpg');
select * from users;
select * from tienda;
select * from productos;

SELECT * FROM tienda WHERE userId = 1;

SELECT productos.*, tienda.nombreTienda FROM productos JOIN tienda ON productos.tienda_prod = tienda.idTienda WHERE tienda.userId = 1 ORDER BY tienda.nombreTienda, productos.nom_producto;

