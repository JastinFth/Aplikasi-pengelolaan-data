exports.isAdmin = (req, res, next) => {
  console.log('Middleware isAdmin - Session User:', req.session.user);
  if(req.session.user && req.session.user.role === 'Admin') {
    next();
  }else{
    console.log('User not authenticated or role not admin');
    res.redirect('/login');
  }
};

exports.isUser = (req, res, next) => {
  console.log('Middleware isUser - Session User:', req.session.user);
  if(req.session.user && req.session.user.role === 'User') {
    next();
  } else {
    console.log('User not authenticated or role not anggota');
    res.redirect('/login');
  }
};