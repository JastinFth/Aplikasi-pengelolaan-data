const { error } = require('pdf-lib');
const User = require('../models/user');
const { use } = require('../routes/web');

exports.getLoginForm = (req, res) => {
  res.render('login', { 
    error: null,
    layout: false
   });
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    let user;

    try {
      user = await User.verifyPassword(username, password);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }

    req.session.user = { 
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      profile_image: user.profile_image || 'default.jpg'
    };

    console.log('Login successful - Session:', req.session.user);

    res.json({
      success: true,
      redirectUrl: user.role === 'Admin' ? '/admin/dashboard' : '/user/dashboard'
    });

  } catch (error) {
    console.error(error);
    res.render('login', { error: 'Terjadi error saat login' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Error destroying session: ', err);
    }
    res.redirect('/login');
  })
};