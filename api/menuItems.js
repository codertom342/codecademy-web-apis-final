
const express = require('express');
const menusItemsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


menusItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
  const values = {$menuItemId: menuItemId};
  db.get(sql, values, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});



menusItemsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId',
        {
            $menuId: req.menu.id
        },
        (err, menuItems) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json(
                {
                    menuId: req.menu.id,
                    menuItems: menuItems,
                }).send();
        }
    } );
});

menusItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;

    if (!name || !description || !inventory || !price) {
        return res.sendStatus(400);
    }
    const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id)' +
        'VALUES ($name, $description, $inventory, $price, $menuId)';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.menu.id
    };
    db.run(sql, values, function (error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
                (error, menuItem) => {
                    res.status(201).json({menuItem: menuItem});
                });
        }
    });
});


menusItemsRouter.put('/:menuItemId', (req, res, next) => {

    const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;

    if (!name || !description || !inventory || !price) {
        return res.sendStatus(400);
    }

    const sql = 'UPDATE MenuItem SET name=$name, description=$description, inventory=$inventory, price=$price '
            + ' WHERE MenuItem.id = $menuItemId';

    const values = {
        $menuItemId: req.params.menuItemId,
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price
    };

    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
                (error, menuItem) => {
                    if (menuItem) {
                        res.status(200).json({menuItem: menuItem});
                    } else {
                        res.status(404).send()
                    }
                });
        }
    })
});

menusItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
    const values = {$menuItemId: req.menuItem.id};
    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(204);
        }
    });
});


module.exports = menusItemsRouter;


