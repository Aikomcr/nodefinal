const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Configuración de sesiones
app.use(session({
  secret: 'tu_secreto', // Cambia esto a una cadena única y segura
  resave: true,
  saveUninitialized: true
}));

// Middleware para parsear datos del cuerpo de la solicitud
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para verificar la autenticación del usuario
function verificarAutenticacion(req, res, next) {
  if (req.session && req.session.loggedin) {
    return next();
  } else {
    return res.status(401).send('Usuario no autenticado');
  }
}

// Conexión a la base de datos (reemplaza los detalles con tu configuración)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nodelogin'
};

const connection = mysql.createConnection(dbConfig);
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    process.exit(1); // Salir del proceso en caso de error de conexión
  }
  console.log('Conexión exitosa a la base de datos');
});

// Función para obtener el ID del usuario autenticado
function obtenerIdUsuarioAutenticado(req) {
  if (req.session && req.session.user) {
    return req.session.user.userId;
  }
  return null;
}

// Manejar la autenticación del usuario
app.post('/login/index', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Lógica para autenticar al usuario (reemplazar con tu propia lógica de autenticación)
  // Aquí debes realizar la consulta a la base de datos y verificar las credenciales
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  connection.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).send('Error de servidor');
    }

    if (results.length > 0) {
      const user = results[0];

      // Almacenar información del usuario en la sesión
      req.session.loggedin = true;
      req.session.user = {
        userId: user.userId,
        name: user.name,
        role: user.role
      };

      res.redirect('/dashboard/dashboard');
    } else {
      res.send('Credenciales incorrectas');
    }
  });
});

// Ruta protegida que requiere autenticación
app.get('/dashboard', verificarAutenticacion, (req, res) => {
  const userId = obtenerIdUsuarioAutenticado(req);

  // Obtén el ID de la tienda asociada al usuario
  connection.query('SELECT idTienda FROM tienda WHERE userId = ? LIMIT 1', [userId], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).send('No se encontró la tienda para el usuario');
    }

    const idTienda = result[0].idTienda;

    // Consulta para obtener productos de la tienda del usuario
    connection.query('SELECT tienda.*, productos.* FROM tienda LEFT JOIN productos ON tienda.idTienda = productos.tienda_prod WHERE tienda.idTienda = ?;', [idTienda], (err, tasksTien) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.render('dashboard/dashboard', { tasksTien });
    });
  });
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  // Destruir la sesión
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/');
  });
});

/* =====================================*/

function index(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM Productos', (err, dashclie) => {
      if(err) {
        res.json(err);
      }
      res.render('dashboard/dashboardCliente', { dashclie });
    });
  });
}

function create(req, res) {

  res.render('tasksTien/create');
}

function store(req, res) {
  const data = req.body;

  req.getConnection((err, conn) => {
    conn.query('INSERT INTO Productos SET ?', [data], (err, rows) => {
      res.redirect('/tasksTien');
    });
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
    userId: null, // Inicializar userId como nulo
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

        // Actualizar el objeto tiendaData con el ID del usuario
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

/* produc-tienda*/

// Controlador para obtener productos de una tienda
function getProductsByStore(req, res) {
  const tiendaId = req.params.tiendaId; // Supongamos que el ID de la tienda está en los parámetros de la URL

  // Realizar la consulta para obtener la tienda y sus productos
  // (Asumiendo que ya has configurado la conexión a la base de datos)
  const query = `
    SELECT tienda.*, productos.*
    FROM tienda
    LEFT JOIN productos ON tienda.idTienda = productos.tienda_prod
    WHERE tienda.idTienda = ?;
  `;

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión a la base de datos:', err);
      return res.status(500).send('Error de servidor');
    }

    conn.query(query, [tiendaId], (err, results) => {
      if (err) {
        console.error('Error al obtener productos:', err);
        return res.status(500).send('Error de servidor');
      }

      const tienda = results[0]; // La información de la tienda está en la primera fila
      const productos = results.slice(1); // El resto son productos

      // Renderizar la vista con la información de la tienda y sus productos
      res.render('dashboard/dashboard', { tienda, productos });
    });
  });
}


/*___________________________________*/

function destroy(req, res) {
  const id = req.body.id;

  req.getConnection((err, conn) => {
    conn.query('DELETE FROM Productos WHERE id = ?', [id], (err, rows) => {
      res.redirect('/tasksTien');
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
      res.render('tasksTien/edit', { tasksTien });
    });
  });
}

function update(req, res) {
  const id = req.params.id;
  const data = req.body;

  req.getConnection((err, conn) => {
    conn.query('UPDATE Productos SET ? WHERE id = ?', [data, id], (err, rows) => {
      res.redirect('/tasksTien');
    });
  });
}


module.exports = {
  index: index,
  create: create,
  createUsu: createUsu,
  storeUsu: storeUsu,
  storeTien: storeTien,
  store: store,
  destroy: destroy,
  getProductsByStore: getProductsByStore,
  edit: edit,
  update: update,
}