let errorCodes      = require("../../errorCodes"),
    mysql           = require("mysql"),
    sqlString       = require("../../database/sqlString/cardReadSqlString"),
    makeSqlQuery    = require("../sqlQuery").makeSqlQuery;

module.exports.kasutajaKaardiLugemisel = async (next, serial) => {
    let sql = mysql.format(sqlString.kasutajaSeisKinn, [serial]);
    return await makeSqlQuery(sql,
        errorCodes.GET_KASUTAJA_KAART_ERROR.code, 
        errorCodes.GET_KASUTAJA_KAART_ERROR.message, 
        next);
};
module.exports.kasutajaCardID = async (next, id) => {
    let sql = mysql.format(sqlString.kasutajaInfID, [id]);
    return await makeSqlQuery(sql,
        errorCodes.KASUTAJA_NIME_ERROR.code, 
        errorCodes.KASUTAJA_NIME_ERROR.message, 
        next);
};
module.exports.kinnitaKasutaja = async (id, next) => {
    let sql = mysql.format(sqlString.updateKinnitatudKAARDIID, [id]);
    let result = await makeSqlQuery(sql,
        errorCodes.KINNITA_KASUTAJA_ERROR.code, 
        errorCodes.KINNITA_KASUTAJA_ERROR.message, 
        next);
    if (result === -1) return result;

    // Kasutaja nime saamine
    sql = mysql.format(sqlString.kasutajaInfID, [id]);
    var kasutaja = await makeSqlQuery(sql,
        errorCodes.KASUTAJA_NIME_ERROR.code, 
        errorCodes.KASUTAJA_NIME_ERROR.message, 
        next);
    if (kasutaja === -1) return kasutaja;

    // Lisa kasutajate muutuste tabelisse rida
    sql = mysql.format(sqlString.insertKasutajaMuutus, [`${kasutaja[0].staatuse_nimetus} ${kasutaja[0].eesnimi} ${kasutaja[0].perenimi}`, "muutmine", "kinnitanud"]);
    result = await makeSqlQuery(sql,
        errorCodes.REGISTREERIMINE_INSERT_KASUTAJA_MUUTUS_ERROR.code, 
        errorCodes.REGISTREERIMINE_INSERT_KASUTAJA_MUUTUS_ERROR.message, 
        next);

    return result;
};
module.exports.registreeriKasutaja = async (uusKasutaja, next) => {
    let sql = mysql.format(sqlString.insertKasutaja, [uusKasutaja.staatus, uusKasutaja.id, uusKasutaja.eesnimi, uusKasutaja.perenimi, uusKasutaja.coetus]);
    let result = await makeSqlQuery(sql,
        errorCodes.INSERT_KASUTAJA_ERROR.code, 
        errorCodes.INSERT_KASUTAJA_ERROR.message, 
        next);
    if (result === -1) return result;

    // Staatuse nimetuse saamine
    sql = mysql.format(sqlString.staatusNimetusID, [uusKasutaja.staatus]);
    var staatus = await makeSqlQuery(sql,
        errorCodes.GET_STAATUS_REGISTREERIMINE_ERROR.code, 
        errorCodes.GET_STAATUS_REGISTREERIMINE_ERROR.message, 
        next);
    if (staatus === -1) return staatus;

    // Lisa kasutajate muutsute tabelisse rida
    sql = mysql.format(sqlString.insertKasutajaMuutus, [`${staatus[0].staatuse_nimetus} ${uusKasutaja.eesnimi} ${uusKasutaja.perenimi}`, "lisamine", "kõik"]);
    result = await makeSqlQuery(sql,
        errorCodes.REGISTREERIMINE_INSERT_KASUTAJA_MUUTUS_ERROR.code, 
        errorCodes.REGISTREERIMINE_INSERT_KASUTAJA_MUUTUS_ERROR.message, 
        next);

    if (result !== -1)
        return staatus[0].staatuse_nimetus;
    return -1;
};