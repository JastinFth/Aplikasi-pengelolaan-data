const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const session = require('express-session')
const userMiddleware = require('./middleware/userMiddleware');

const app = express();
const port = 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'itsSecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressLayouts);

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use(userMiddleware);

app.use('/', require('./routes/web'));

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}/`);
});