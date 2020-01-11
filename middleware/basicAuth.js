let basicAuth       = require('basic-auth'),
    mysql           = require('mysql'),
    makeSqlQuery    = require('./sqlFun').makeSqlQuery,
    errorCodes      = require('./errorCodes'),
    sqlString       = require('./sqlString');

module.exports = async (req, res, next) => {
  let user = basicAuth(req);
  let sql = mysql.format(sqlString.getCredentials, ['basicAuth']);
  let credentials = await makeSqlQuery(
      sql, 
      errorCodes.BASIC_CREDENTIALS_FAILED.code,
      errorCodes.BASIC_CREDENTIALS_FAILED.message,
      next);

  if (!user || !user.name || !user.pass || credentials === -1) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
  }
  if (user.name === credentials[0].kasutaja_nimi && user.pass === credentials[0].salasona) {
      next();
  } else {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
  }
};