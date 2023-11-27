const path = require('path');
const fileUpload = require('express-fileupload');

function indexTien(req, res) {
  // Obtén el ID del usuario de la sesión
  const userId = req.session.user.userId;

  req.getConnection((err, conn) => {
    // Utiliza una consulta JOIN para obtener los productos de la tienda del usuario
    conn.query('SELECT productos.* FROM productos JOIN tienda ON productos.tienda_prod = tienda.idTienda WHERE tienda.userId = ?', [userId], (err, tasksTien) => {
      if (err) {
        res.json(err);
      }
      res.render('dashboard/dashboard', { tasksTien });
    });
  });
}

function indexProductos(req, res) {
  // Obtén el ID del usuario de la sesión
  const userId = req.session.user.userId;

  req.getConnection((err, conn) => {
    // Utiliza una consulta JOIN para obtener los productos de la tienda del usuario
    const query = `
      SELECT productos.*, tienda.nombreTienda
      FROM productos
      JOIN tienda ON productos.tienda_prod = tienda.idTienda
      WHERE tienda.userId = ?
      ORDER BY tienda.nombreTienda, productos.nom_producto;
    `;

    conn.query(query, [userId], (err, productos) => {
      if (err) {
        res.json(err);
      }
      res.render('login/productos', { dashclie: productos });
    });
  });
}

function index(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM Productos', (err, dashclie) => {
      if(err) {
        res.json(err);
      }
      res.render('login/productos', { dashclie });
    });
  });
}

function create(req, res) {

  res.render('tasks/create');
}

function store(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No se han seleccionado archivos.');
  }

  const data = req.body;
  const imagen_producto = req.files.imagen_producto;

  // Mueve el archivo a la carpeta de imágenes
  const uploadPath = path.join(__dirname, '..', 'public', 'img', imagen_producto.name);

  imagen_producto.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    // Verifica si la sesión del usuario y la propiedad userId existen
    if (req.session && req.session.user && req.session.user.userId) {
      const userId = req.session.user.userId;

      // Verifica si el usuario es una tienda válida
      req.getConnection((err, conn) => {
        conn.query('SELECT * FROM tienda WHERE userId = ?', [userId], (err, result) => {
          if (err) {
            return res.status(500).send('Error de servidor');
          }

          if (result.length === 0) {
            // Si el usuario no es una tienda, asigna un valor predeterminado o lanza un error
            data.tienda_prod = null; // o asigna un valor predeterminado válido para tienda_prod
          } else {
            // Si el usuario es una tienda, asigna el ID de la tienda a tienda_prod
            data.tienda_prod = result[0].idTienda;
          }

          // Asigna la ruta de la imagen al campo imagen_producto
          data.imagen_producto = `/img/${imagen_producto.name}`;

          // Continúa con la inserción en la tabla productos
          req.getConnection((err, conn) => {
            conn.query('INSERT INTO productos SET ?', [data], (err, rows) => {
              if (err) {
                console.error('Error al insertar el producto:', err);
                return res.status(500).send('Error de servidor');
              }
              res.redirect('/dashTiend');
            });
          });
        });
      });
    } else {
      return res.status(401).send('Acceso no autorizado'); // O maneja la falta de sesión de usuario de otra manera
    }
  });
}


/*Crear usuario */
function createUsu(req, res) {

  res.render('createUsu/create');
}

function storeUsu(req, res) {
  const data = req.body;

  req.getConnection((err, conn) => {
    conn.query('INSERT INTO users SET ?', [data], (err, userResult) => {
      res.redirect('/login/index');
    });
  });
}

/* */

/* Crear tienda */

function storeTien(req, res) {
  // Extraer datos del cuerpo de la solicitud
  const userData = {
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    role: 'usuTienda', // Agrega el rol específico para la tienda
  };

  const tiendaData = {
    nombreTienda: req.body.nombreTienda,
    descTienda: req.body.descTienda,
    categTienda: req.body.categTienda,
  };

  // Obtener conexión a la base de datos desde la solicitud
  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión a la base de datos:', err);
      return res.status(500).send('Error de servidor');
    }

    // Iniciar una transacción para asegurar la consistencia en ambas inserciones
    conn.beginTransaction((err) => {
      if (err) {
        console.error('Error al iniciar la transacción:', err);
        return res.status(500).send('Error de servidor');
      }

      // Insertar datos en la tabla users
      conn.query('INSERT INTO users SET ?', [userData], (err, userResult) => {
        if (err) {
          // Revertir la transacción en caso de error
          return conn.rollback(() => {
            console.error('Error al insertar en users:', err);
            return res.status(500).send('Error de servidor');
          });
        }

        // Obtener el ID del usuario recién insertado
        const userId = userResult.insertId;

        // Asignar el userId a la tiendaData
        tiendaData.userId = userId;

        // Insertar datos en la tabla tienda
        conn.query('INSERT INTO tienda SET ?', [tiendaData], (err, tiendaResult) => {
          if (err) {
            // Revertir la transacción en caso de error
            return conn.rollback(() => {
              console.error('Error al insertar en tienda:', err);
              return res.status(500).send('Error de servidor');
            });
          }

          // Confirmar la transacción
          conn.commit((err) => {
            if (err) {
              console.error('Error al confirmar la transacción:', err);
              return res.status(500).send('Error de servidor');
            }

            // Redirigir al usuario a la página deseada después del éxito
            res.redirect('/login/intienda');
          });
        });
      });
    });
  });
}


/*______________________________________________*/

/* */

function destroy(req, res) {
  const id = req.body.id;

  req.getConnection((err, conn) => {
    conn.query('DELETE FROM Productos WHERE id = ?', [id], (err, rows) => {
      res.redirect('/dashTiend');
    });
  })
}

function edit(req, res) {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM Productos WHERE id = ?', [id], (err, tasksTien) => {
      if(err) {
        res.json(err);
      }
      res.render('tasks/edit', { tasksTien });
    });
  });
}

function update(req, res) {
  const id = req.params.id;
  const data = req.body;

  req.getConnection((err, conn) => {
    conn.query('UPDATE Productos SET ? WHERE id = ?', [data, id], (err, rows) => {
      res.redirect('/dashTiend');
    });
  });
}


module.exports = {
  index: index,
  indexProductos: indexProductos,
  indexTien: indexTien,
  create: create,
  createUsu: createUsu,
  storeUsu: storeUsu,
  storeTien: storeTien,
  store: store,
  destroy: destroy,
  edit: edit,
  update: update,
}