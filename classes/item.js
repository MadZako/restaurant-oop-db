const path = require('path')
const db = require('better-sqlite3')(path.join(__dirname, '../db.sqlite'))

class Item {
	static all = [];
	index;
	name;
	price;
	stock;
	static init = function () {
		db.prepare('CREATE TABLE IF NOT EXISTS items (itemId INTEGER, menuId INTEGER, name TEXT, price REAL, stock BOOLEAN, PRIMARY KEY (itemId));').run();
		const itemsInDB = db.prepare('SELECT * FROM items;').all();
		itemsInDB.forEach(item => {
			const { itemId, name, price, stock } = item;
			const newItem = new Item(name, price, itemId);
			if (stock === 0) newItem.toggleStock();
		})
	}

	constructor (name, price, id) {
		if (typeof name !== 'string') throw new Error('name must be string');
		this.name = name;
		this.price = price;
		this.stock = true;
		if (id) {
			this.index = id;
		} else {
			this.index = Item.all.length + 1;
			db.prepare('INSERT INTO items (menuID, name, price, stock) VALUES (?, ?, ?, ?);').run(0, this.name, this.price, 1);
		}
		Item.all.push(this);
	}

	updateItem (name, price, stock) {
		Item.all[this.index - 1] = {
			index: this.index,
			name: name,
			price: price,
			stock: stock,
		};

		let state = (stock) ? 1 : 0;
		db.prepare('UPDATE items SET name = ?, price = ?, stock = ? WHERE itemId = ?;').run(name, price, state, this.index);
	}

	changePrice (newPrice) {
		this.price = newPrice;
		db.prepare('UPDATE items SET price = ? WHERE itemId = ?;').run(newPrice, this.index);
	}

	toggleStock () {
		this.stock = !this.stock;
		let state = (this.stock) ? 1 : 0;
		db.prepare('UPDATE items SET stock = ? WHERE itemId = ?;').run(state, this.index);
	}
}

module.exports = Item;