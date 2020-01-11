let basicAuth       = require('basic-auth'),
    makeSqlQuery    = require('./sqlFun').makeSqlQuery,
    errorCodes      = require('./errorCodes'),
    mysql           = require('mysql'),
    sqlString       = require('./sqlString');

module.exports = async (req, res, next) => {
  let user = basicAuth(req);
  let sql = mysql.format(sqlString.getCredentials, ['basicAuth']);
  let credentials = await makeSqlQuery(
      sql, 
      errorCodes.BASIC_CREDENTIALS_FAILED.code,
      errorCodes.BASIC_CREDENTIALS_FAILED.message,
      next)[0];

  if (!user || !user.name || !user.pass || credentials === -1) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
  }
  if (user.name === credentials.kasutaja_nimi && user.pass === credentials.salasona) {
      next();
  } else {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
  }
};