const pool = require('../config/database');
const validator = require('validator');
const  bcrypt = require('bcrypt');

class User {
  static async getAllUsers() {
    const [rows] = await pool.execute('SELECT * FROM users');
    return rows;
  }

  static async create( username, name, password, role ) {
    if(!validator.isLength(username, { min: 3, max:20})) {
      throw new Error("Username must be between 3 - 20 characters");
    }
    if(!validator.isLength(name, { min: 3, max:75})) {
      throw new Error("Name must be between 3 - 75 characters");
    }
    if(!validator.isLength(password, { min: 8 })) {
      throw new Error("Password at least 8 characters");
    }
    if(!['Admin', 'User'].includes(role)) {
      throw new Error("Role must admin or user"); 
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.execute('INSERT INTO users (username, name, password, role) VALUES (?,?,?,?)', [ username, name, hashedPassword, role ]);
    return { id: result.insertId , username, name, role };
  }

  static async verifyPassword(username, password) {
    const user = await this.getUserByUsername(username);

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    return user;
  }
  
  static async getUserById(id) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows;
  }

  static async getUserByUsername(username) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }
  
  static async update(id, data) {
    const { username, name, password, role } = data;

    if (!password) {
      const [currentUser] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);

      if (currentUser && currentUser[0]) {
        await pool.execute('UPDATE users SET username = ?, name = ?, role = ? WHERE id = ?', [username, name, role, id]);
      } else {
        throw new Error('User not found');
      }

    } else {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      console.log(hashedPassword)

      await pool.execute('UPDATE users SET username = ?, name = ?, password = ?, role = ? WHERE id = ?', [username, name, hashedPassword, role, id]);
    }
    
    return { id, username, name, role };
  }

  static async delete(id) {
    await pool.execute('DELETE FROM users WHERE id = ?', [ id ]);
  }  

  static async search(searchTerm) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username LIKE ? OR name LIKE ? OR role LIKE ?', [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
    return rows;
  }

  static async updateProfile(id, data) {
    const { name, profile_image } = data;
  
    if(!name) {
      throw new Error('Name is required'); 
    }
  
    let query = 'UPDATE users SET name = ?';
    let params = [name];
  
    if(profile_image) {
      query += ', profile_image = ?';
      params.push(profile_image);
    }
  
    query += ' WHERE id = ?';
    params.push(id);
  
    await pool.execute(query, params);
  
    const [updatedUser] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    
    return updatedUser[0];u
  }

  static async updatePassword(id, newPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
  }
}

module.exports = User;