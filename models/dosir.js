const pool = require('../config/database');
const validator = require('validator');

class Dosir {
  static async getAllDosirs() {
    const [rows] = await pool.execute('SELECT * FROM dosirs');
    return rows;
  }

  static async create(notas, no_dosir, name, shelf) {
    if (!validator.isLength(notas, { min: 11, max: 20 })) {
      throw new Error("Notas must be between 11 - 20 characters");
    }
    
    if (!validator.isLength(name, { min: 3, max: 75 })) {
      throw new Error("Name must be between 3 - 75 characters");
    }

    if (!validator.isLength(shelf, { min: 2 })) {
      throw new Error("Shelf at least 2 characters");
    }

    const [existing] = await pool.execute('SELECT id FROM dosirs WHERE notas = ?', [notas]);

    if (existing.length > 0) {
      throw new Error("Notas are already registered in the system");
    }

    const [result] = await pool.execute('INSERT INTO dosirs (notas, no_dosir, name, shelf) VALUES (?,?,?,?)', [notas, no_dosir, name, shelf]);
    return { id: result.insertId, notas, no_dosir, name, shelf }
  }

  static async getDosirById(id) {
    const [rows] = await pool.execute('SELECT * FROM dosirs WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, data) {
    const { notas, no_dosir, name, shelf } = data;

    if (!notas || !no_dosir || !name || !shelf) {
      throw new Error('All fields are required');
    }

    await pool.execute('UPDATE dosirs SET notas = ?, no_dosir = ?, name = ?, shelf = ? WHERE id = ?', 
      [notas, no_dosir, name, shelf, id]);
    
    return { id, notas, no_dosir, name, shelf };
  }

  static async delete(id) {
    await pool.execute('DELETE FROM dosirs WHERE id = ?', [id]);
  }

  static async search(searchTerm) {
    const [rows] = await pool.execute('SELECT * FROM dosirs WHERE notas LIKE ? OR no_dosir LIKE ? OR name LIKE ? OR shelf LIKE ?', [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
    return rows;
  }
}

module.exports = Dosir;