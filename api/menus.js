const express = require('express');

const menusRouter = express.Router();
const menuItemsRouter = require('./menuItems');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


menusRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const values = {$menuId: menuId};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu',
        (err, menus) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menus: menus});
        }
    } );
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});


menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title
    if (!title) {
        return res.sendStatus(400);
    }
    const sql = 'INSERT INTO Menu (title)' + 'VALUES ($title)';
    const values = {
        $title: title
    };
    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
        db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
            (error, menu) => {
                res.status(201).json({menu: menu});
            });
        }
    });
});

menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title
    if (!title) {
        return res.sendStatus(400);
    }
    const sql = 'UPDATE Menu SET title=$title' + ' WHERE Menu.id = $menuId';

    const values = {
        $menuId: req.menu.id,
        $title: title
    };

    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
        db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.menu.id}`,
            (error, menu) => {
            res.status(200).json({menu: menu});
        });
        }
    });
});

menusRouter.delete('/:menuId', (req, res, next) => {

    const sql ="SELECT * FROM MenuItem WHERE menu_id = $menuId"
    const values = {$menuId: req.menu.id};
    db.get(sql, values, (error, menuItems) => {
        if (menuItems) {
            res.sendStatus(400);
        } else {
            const sql = 'DELETE FROM Menu WHERE Menu.id = $menuId';
            const values = {$menuId: req.menu.id};
            db.run(sql, values, (error) => {
                if (error) {
                    next(error);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });

});


menusRouter.use('/:menuId/menu-items', menuItemsRouter);

module.exports = menusRouter;