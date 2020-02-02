let errorCodes      = require("../../errorCodes"),
    mysql           = require("mysql"),
    sqlString       = require("../sqlString/ostmineSqlString"),
    makeSqlQuery    = require("../sqlQuery");

module.exports.getTootedJaKasutaja = async (id, next) => {
    let arr = [];
    let result = await makeSqlQuery(sqlString.toode1,
        errorCodes.SOOK_JOOK_ERROR.code, 
        errorCodes.SOOK_JOOK_ERROR.message, 
        next);
    if (result === -1) return result;

    arr.push(result);
    result = await makeSqlQuery(sqlString.toode2,
        errorCodes.SOOK_JOOK_ERROR.code, 
        errorCodes.SOOK_JOOK_ERROR.message, 
        next);
    if (result === -1) return result;
    
    arr.push(result);
    result = await makeSqlQuery(sqlString.toode3,
        errorCodes.SOOK_JOOK_ERROR.code, 
        errorCodes.SOOK_JOOK_ERROR.message, 
        next);
    if (result === -1) return result;
    
    arr.push(result);
    result = await makeSqlQuery(sqlString.toode4,
        errorCodes.SOOK_JOOK_ERROR.code, 
        errorCodes.SOOK_JOOK_ERROR.message, 
        next);
    if (result === -1) return result;
    
    arr.push(result);
    result = await makeSqlQuery(sqlString.toode5,
        errorCodes.SOOK_JOOK_ERROR.code, 
        errorCodes.SOOK_JOOK_ERROR.message, 
        next);
    if (result === -1) return result;
    
    arr.push(result);
    result = await makeSqlQuery(sqlString.toode6,
        errorCodes.SOOK_JOOK_ERROR.code, 
        errorCodes.SOOK_JOOK_ERROR.message, 
        next);
    if (result === -1) return result;

    arr.push(result);
    let sql = mysql.format(sqlString.kasutaja_seisID, [id]);
    result = await makeSqlQuery(sql,
        errorCodes.KASUTAJA_ERROR_OST.code, 
        errorCodes.KASUTAJA_ERROR_OST.message, 
        next);
    if (result === -1) return result;
    
    arr.push(result);
    return arr;
};
module.exports.kasutajadPaneKirja = async (id, next) => {
    let sql = mysql.format(sqlString.kasutajadPaneKirja, [id]);
    return await makeSqlQuery(sql,
        errorCodes.KASUTAJATE_ERROR_OST.code, 
        errorCodes.KASUTAJATE_ERROR_OST.message, 
        next);
};
module.exports.viimase12hKasutajad = async (id, next) => {
    let sql = mysql.format(sqlString.viimase12hKasutajad, [id]);
    return await makeSqlQuery(sql,
        errorCodes.VIIMASE_12H_KASUTAJATE_ERROR.code, 
        errorCodes.VIIMASE_12H_KASUTAJATE_ERROR.message, 
        next);
};
module.exports.myygiHindNim = async (toode, next) => {
    let sql = mysql.format(sqlString.myygiHindNIMETUS, [toode]);
    return await makeSqlQuery(sql,
        errorCodes.TOOTE_HINNA_ERROR.code, 
        errorCodes.TOOTE_HINNA_ERROR.message, 
        next);
};
module.exports.tooteKategooriaOmaHindID = async (toode, next) => {
    let sql = mysql.format(sqlString.tooteKategooriaOmaHindID, [toode]);
    return await makeSqlQuery(sql,
        errorCodes.TOOTE_KATEGOORIA_ERROR.code, 
        errorCodes.TOOTE_KATEGOORIA_ERROR.message, 
        next);
};
module.exports.volgStaatusID = async (id, next) => {
    let sql = mysql.format(sqlString.volgStaatusID, [id]);
    return await makeSqlQuery(sql,
        errorCodes.VÕLA_STAATUSE_ERROR.code, 
        errorCodes.VÕLA_STAATUSE_ERROR.message, 
        next);
};
module.exports.updateVolgID = async (id, volg, next) => {
    let sql = mysql.format(sqlString.updateVolgID, [volg, id]);
    return await makeSqlQuery(sql,
        errorCodes.UPDATE_VOLG_ERROR.code, 
        errorCodes.UPDATE_VOLG_ERROR.message, 
        next);
};
module.exports.hetkeKogusNimetus = async (toode, next) => {
    let sql = mysql.format(sqlString.hetke_kogusNIMETUS, [toode]);
    return await makeSqlQuery(sql,
        errorCodes.TOOTE_KOGUS_ERROR.code, 
        errorCodes.TOOTE_KOGUS_ERROR.message, 
        next);
};
module.exports.updateKogusNimetus = async (total, toode, next) => {
    let sql = mysql.format(sqlString.updateKogusNIMETUS, [total, toode]);
    return await makeSqlQuery(sql,
        errorCodes.UPDATE_KOGUS_ERROR.code, 
        errorCodes.UPDATE_KOGUS_ERROR.message, 
        next);
};
module.exports.lisaOst = async (ost, reb, next) => {
    let sql = mysql.format(sqlString.lisaOst, [ost.nimi, ost.toode, ost.kogus, ost.summa, ost.tasuta, reb, ost.oma]);
    return await makeSqlQuery(sql,
        errorCodes.INSERT_OST_ERROR.code, 
        errorCodes.INSERT_OST_ERROR.message, 
        next);
};