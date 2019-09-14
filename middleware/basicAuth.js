let basicAuth = require('basic-auth');

module.exports = (req, res, next) => {
  let user = basicAuth(req);
  if (!user || !user.name || !user.pass) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
  }
  if (user.name === 'aa' && user.pass === 'aa') {
      next();
  } else {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
  }
};