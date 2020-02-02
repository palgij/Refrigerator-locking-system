let errorCodes      = require("../../errorCodes"),
    mysql           = require("mysql"),
    sqlString       = require("../sqlString/adminSqlString"),
    makeSqlQuery    = require("../sqlQuery").makeSqlQuery;

module.exports.getOstjadTop = async (next) =>
    await makeSqlQuery(sqlString.topOstjad,
        errorCodes.KASUTAJATE_TOP_ERROR.code, 
        errorCodes.KASUTAJATE_TOP_ERROR.message, 
        next);
module.exports.getTootedTop = async (next) =>
    await makeSqlQuery(sqlString.topTooted,
        errorCodes.TOODETE_TOP_ERROR.code, 
        errorCodes.TOODETE_TOP_ERROR.message, 
        next);
module.exports.getKasutajad = async (next) =>
    await makeSqlQuery(sqlString.kasutajad,
        errorCodes.GET_KASUTAJAD_ERROR.code, 
        errorCodes.GET_KASUTAJAD_ERROR.message, 
        next);
module.exports.getKasutaja = async (id, next) => {
    let sql = mysql.format(sqlString.kasutajaID, [id]);
    return await makeSqlQuery(sql,
        errorCodes.GET_KASUTAJA_ERROR.code, 
        errorCodes.GET_KASUTAJA_ERROR.message, 
        next);
};
module.exports.getToode = async (id, next) => {
    let sql = mysql.format(sqlString.toodeID, [id]);
    return await makeSqlQuery(sql,
        errorCodes.GET_TOODE_ERROR.code, 
        errorCodes.GET_TOODE_ERROR.message, 
        next);
};
module.exports.getJoogid = async (next) =>
    await makeSqlQuery(sqlString.joogid,
        errorCodes.GET_JOOGID_ERROR.code, 
        errorCodes.GET_JOOGID_ERROR.message, 
        next);
module.exports.getSoogid = async (next) =>
    await makeSqlQuery(sqlString.soogid,
        errorCodes.GET_SOOGID_ERROR.code, 
        errorCodes.GET_SOOGID_ERROR.message, 
        next);
module.exports.getOstud = async (req, next) => {
    let sql;
    if (req.params.page >= 1) sql = sqlString.ostud + ' LIMIT ' + (req.params.page * 100 - 100) + ', 100';
    else sql = sqlString.ostud;
    return await makeSqlQuery(sql,
        errorCodes.GET_OSTUD_ERROR.code, 
        errorCodes.GET_OSTUD_ERROR.message, 
        next);
};
module.exports.getVolad = async (next) =>
    await makeSqlQuery(sqlString.volad,
        errorCodes.GET_VOLAD_ERROR.code, 
        errorCodes.GET_VOLAD_ERROR.message, 
        next);
module.exports.nulliVolad = async (next, text) => {
    let result = await makeSqlQuery(sqlString.nulliVolad,
        errorCodes.NULLI_VOLAD_ERROR.code, 
        errorCodes.NULLI_VOLAD_ERROR.message, 
        next);
    if (result === -1) return result;

    // Salvesta tegevus kasutajate muutustesse
    let sql = mysql.format(sqlString.insertKasutajaMuutus, ["Kõik kasutajad", text, "võlg"]);
    result = await makeSqlQuery(sql,
        errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.code, 
        errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.message, 
        next);
    
    return result;
};
module.exports.deleteKasutaja = async (req, next) => {
    // Otsi nimi enne kustutamist, muutuste jaoks
    let sql = mysql.format(sqlString.kasutajaNimiID, [req.params.id]);
    let result = await makeSqlQuery(sql,
        errorCodes.GET_KASUTAJA_ERROR.code, 
        errorCodes.GET_KASUTAJA_ERROR.message, 
        next);

    if (result === -1) return result;

    let nimi = `${result[0].staatuse_nimetus} ${result[0].eesnimi} ${result[0].perenimi}`;

    // Kustuta kasutaja
    sql = mysql.format(sqlString.deleteKasutajaID, [req.params.id]);
    result = await makeSqlQuery(sql,
        errorCodes.DELETE_KASUTAJA_ERROR.code, 
        errorCodes.DELETE_KASUTAJA_ERROR.message, 
        next);
    if (result === -1) return result;

    // Lisa kasutajate muutuste tabelisse rida
    sql = mysql.format(sqlString.insertKasutajaMuutus, [nimi, "kustutamine", "kõik"]);
    result = await makeSqlQuery(sql,
        errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.code, 
        errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.message, 
        next);
    
    return result;
};
module.exports.deleteToode = async (req, next) => {
    // Otsi nimi enne kustutamist, muutuste jaoks
    let sql = mysql.format(sqlString.tooteNimetusID, [req.params.id]);
    let toode = await makeSqlQuery(sql,
        errorCodes.GET_TOODE_ERROR.code, 
        errorCodes.GET_TOODE_ERROR.message, 
        next);
    if (toode === -1) return toode;

    // Kustuta toode
    sql = mysql.format(sqlString.deleteToodeID, [req.params.id]);
    var result = await makeSqlQuery(sql,
        errorCodes.DELETE_TOODE_ERROR.code, 
        errorCodes.DELETE_TOODE_ERROR.message, 
        next);
    if (result === -1) return result;

    // Lisa lao muutustesse tabelisse rida
    sql = mysql.format(sqlString.insertTooteMuutus, [toode[0].toote_nimetus, toode[0].hetke_kogus * -1, "kustutamine"]);
    result = await makeSqlQuery(sql,
        errorCodes.INSERT_TOOTE_MUUTUS_ERROR.code, 
        errorCodes.INSERT_TOOTE_MUUTUS_ERROR.message, 
        next);
    
    return result;
};
module.exports.getOstudAeg = async (req, next) => {
    let sql = mysql.format(sqlString.ostudAEG, [req.body.start, req.body.end]);
    return await makeSqlQuery(sql,
        errorCodes.GET_TOOTED_ERROR.code, 
        errorCodes.GET_TOOTED_ERROR.message, 
        next);
};
module.exports.getToodeteMuutused = async (req, next) => {
    let sql;
    if (req.params.page >= 1) sql = sqlString.toodeteMuutused + ' LIMIT ' + (req.params.page * 100 - 100) + ', 100';
    else sql = sqlString.toodeteMuutused;
    return await makeSqlQuery(sql,
        errorCodes.GET_TOODETE_MUUTUSED_ERROR.code, 
        errorCodes.GET_TOODETE_MUUTUSED_ERROR.message, 
        next);
};
module.exports.getKasutajateMuutused = async (req, next) => {
    let sql;
    if (req.params.page >= 1) sql = sqlString.kasutajateMuutused + ' LIMIT ' + (req.params.page * 100 - 100) + ', 100';
    else sql = sqlString.kasutajateMuutused;
    return await makeSqlQuery(sql,
        errorCodes.GET_KASUTAJATE_MUUTUSED_ERROR.code, 
        errorCodes.GET_KASUTAJATE_MUUTUSED_ERROR.message, 
        next);
};
module.exports.updateKasutaja = async (next, kasutaja, muutused) => {
    // Update kasutaja
    let nimetus;
    let sql = mysql.format(sqlString.updateKasutaja, [kasutaja.seisus, kasutaja.staatus, kasutaja.eesnimi, kasutaja.perenimi, kasutaja.volg, kasutaja.kinnitatud, kasutaja.id]);
    let result = await makeSqlQuery(sql,
        errorCodes.UPDATE_KASUTAJA_ERROR.code, 
        errorCodes.UPDATE_KASUTAJA_ERROR.message, 
        next);
    if (result === -1) return result;

    // Sisesta muutus kasutajatesse
    sql = mysql.format(sqlString.staatusNimetusID, [kasutaja.staatus]);
    var nim = await makeSqlQuery(sql,
        errorCodes.GET_STAATUS_ERROR.code, 
        errorCodes.GET_STAATUS_ERROR.message, 
        next);
    if (nim === -1) return nim;

    muutused.length === 6 ? nimetus = "kõik" : nimetus = muutused.join(", ");
    sql = mysql.format(sqlString.insertKasutajaMuutus, [`${nim[0].staatuse_nimetus} ${kasutaja.eesnimi} ${kasutaja.perenimi}`, "muutmine", nimetus]);
    result = await makeSqlQuery(sql,
        errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.code, 
        errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.message, 
        next);
    
    return result;
};
module.exports.updateToode = async (next, toode) => {
    // Update toode
    let sql = mysql.format(sqlString.updateToode, [toode.kategooria, toode.toote_nimetus, toode.uusKogus, toode.myygi_hind, toode.oma_hind, toode.id]);
    let result = await makeSqlQuery(sql,
        errorCodes.UPDATE_TOODE_ERROR.code, 
        errorCodes.UPDATE_TOODE_ERROR.message, 
        next);
    if (result === -1) return result;

    // Sisesta koguse muutus lattu kui vaja
    if (toode.uusKogus - toode.vanaKogus !== 0) {
        sql = mysql.format(sqlString.insertTooteMuutus, [toode.toote_nimetus, toode.uusKogus - toode.vanaKogus, "muutmine"]);
        result = await makeSqlQuery(sql,
            errorCodes.INSERT_TOOTE_MUUTUS_ERROR.code, 
            errorCodes.INSERT_TOOTE_MUUTUS_ERROR.message, 
            next);
        return result;
    }
};
module.exports.getToodeID = async (req, next) => {
    let sql = mysql.format(sqlString.getToodeID, [req.params.id]);
    return await makeSqlQuery(sql,
        errorCodes.GET_TOODE_ERROR.code, 
        errorCodes.GET_TOODE_ERROR.message, 
        next);
};
module.exports.insertToode = async (next, toode) => {
    // Insert toode
    let sql = mysql.format(sqlString.insertToode, [toode.kategooria, toode.toote_nimetus, toode.kogus, toode.myygi_hind, toode.oma_hind]);
    let result = await makeSqlQuery(sql,
        errorCodes.INSERT_TOODE_ERROR.code, 
        errorCodes.INSERT_TOODE_ERROR.message, 
        next);
    if (result === -1) return result;

    // Sisesta toote lisamine lao muutustesse
    sql = mysql.format(sqlString.insertTooteMuutus, [toode.toote_nimetus, toode.kogus, "lisamine"]);
    result = await makeSqlQuery(sql,
        errorCodes.INSERT_TOOTE_MUUTUS_ERROR.code, 
        errorCodes.INSERT_TOOTE_MUUTUS_ERROR.message, 
        next);

    return result;
};
module.exports.rebasteJoodudOlled = async (next) =>
    await makeSqlQuery(sqlString.rebasteJoodudOlled,
        errorCodes.REBASTE_OLLED_ERROR.code,
        errorCodes.REBASTE_OLLED_ERROR.message,
        next);
module.exports.getTooted = async (next) =>
    await makeSqlQuery(sqlString.getTooted,
        errorCodes.GET_KOIK_TOOTED_ERROR.code,
        errorCodes.GET_KOIK_TOOTED_ERROR.message,
        next);
module.exports.insertKuuLopp = async (rebasteOlled, sumOfVolad, next) => {
    let sql = mysql.format(sqlString.insertKuuLopp, [rebasteOlled, sumOfVolad]);
    return await makeSqlQuery(sql,
        errorCodes.INSERT_KUU_LOPP_ERROR.code,
        errorCodes.INSERT_KUU_LOPP_ERROR.message,
        next);
};
module.exports.getLockState = async (next) => 
    await makeSqlQuery(sqlString.getLatestLockState,
        errorCodes.LOCK_STATE_FETCH_FAILED.code,
        errorCodes.LOCK_STATE_FETCH_FAILED.message,
        next);
module.exports.setLockState = async (isLocked, next) => {
    let sql = mysql.format(sqlString.setLockState, [isLocked]);
    return await makeSqlQuery(sql,
        errorCodes.INSERT_OST_ERROR.code, 
        errorCodes.INSERT_OST_ERROR.message, 
        next);
};
module.exports.getCredentials = async (name, next) => {
    let sql = mysql.format(sqlString.getCredentials, [name]);
    return await makeSqlQuery(sql,
        errorCodes.CREDENTIALS_FAILED.code,
        `${errorCodes.CREDENTIALS_FAILED.message} ${name}`,
        next);
};