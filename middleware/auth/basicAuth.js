let basicAuth   = require('basic-auth'),
    sqlFun      = require('../database/sqlFun/adminSqlFun');

module.exports = async (req, res, next) => {
    let user = basicAuth(req);
    let credentials = await sqlFun.getCredentials('basicAuth', next);

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