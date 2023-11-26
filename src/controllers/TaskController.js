function indexTien(req, res) {
  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM Productos', (err, tasksTien) => {
      if(err) {
        res.json(err);
      }
      res.render('dashboard/dashboard', { tasksTien });
    });
  });
}

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

  res.render('tasks/create');
}

function store(req, res) {
  const data = req.body;

  req.getConnection((err, conn) => {
    conn.query('INSERT INTO productos SET ?', [data], (err, rows) => {
      res.redirect('/dashTiend');
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

        // Actualizar el objeto userData con el ID del usuario
        userData.userId = userId;

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