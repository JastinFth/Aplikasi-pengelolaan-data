const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    if (req.session.user) {
      const [user] = await User.getUserById(req.session.user.id);
      res.locals.user = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        profile_image: user.profile_image || 'default.jpg',
      };
      console.log('Updated res.locals.user:', res.locals.user);
    }
    next();
  } catch (error) {
    console.error('Error in user middleware:', error);
    next();
  }
};