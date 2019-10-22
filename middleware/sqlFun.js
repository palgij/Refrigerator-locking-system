let database    = require("../middleware/database"),
    errorCodes  = require("../middleware/errorCodes"),
    mysql       = require("mysql"),
    sqlString   = require("../middleware/sqlString");

// ====================================================
// ====================================================
// ================== ADMINI SQL FUN ==================
// ====================================================
// ====================================================
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
    if (req.params.page > 1) sql = sqlString.ostud + ' LIMIT ' + (req.params.page * 50 - 50) + ', 50';
    else sql = sqlString.ostud;
    return await makeSqlQuery(sql,
        errorCodes.GET_OSTUD_ERROR.code, 
        errorCodes.GET_OSTUD_ERROR.message, 
        next);
};
module.exports.getVolad = async (next) =>
    await makeSqlQuery(sqlString.voladsql,
        errorCodes.GET_VOLAD_ERROR.code, 
        errorCodes.GET_VOLAD_ERROR.message, 
        next);
module.exports.nulliVolad = async (next) => {
    await makeSqlQuery(sqlString.nulliVolad,
        errorCodes.NULLI_VOLAD_ERROR.code, 
        errorCodes.NULLI_VOLAD_ERROR.message, 
        next);
    // Salvesta tegevus kasutajate muutustesse
    let sql = mysql.format(sqlString.insertKasutajaMuutus, ["Kõik kasutajad", "võlgade nullimine", "võlg"]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.code, 
        errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.message, 
        next);
};
module.exports.deleteKasutaja = async (req, next) => {
    // Otsi nimi enne kustutamist, muutuste jaoks
    let sql = mysql.format(sqlString.kasutajaNimiID, [req.params.id]);
    let kasutaja = await sqlFun.makeSqlQuery(sql,
        errorCodes.GET_KASUTAJA_ERROR.code, 
        errorCodes.GET_KASUTAJA_ERROR.message, 
        next);
    let nimi = `${kasutaja[0].nimetus} ${kasutaja[0].eesnimi} ${kasutaja[0].perenimi}`;

    // Kustuta kasutaja
    sql = mysql.format(sqlString.deleteKasutajaID, [req.params.id]);
    await makeSqlQuery(sql,
        errorCodes.DELETE_KASUTAJA_ERROR.code, 
        errorCodes.DELETE_KASUTAJA_ERROR.message, 
        next);

    // Lisa kasutajate muutuste tabelisse rida
    sql = mysql.format(sqlString.insertKasutajaMuutus, [nimi, "kustutamine", "kõik"]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.code, 
        errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.message, 
        next);
};
module.exports.deleteToode = async (req, next) => {
    // Otsi nimi enne kustutamist, muutuste jaoks
    let sql = mysql.format(sqlString.tooteNimetusID, [req.params.id]);
    let toode = await sqlFun.makeSqlQuery(sql,
        errorCodes.GET_TOODE_ERROR.code, 
        errorCodes.GET_TOODE_ERROR.message, 
        next);

    // Kustuta toode
    sql = mysql.format(sqlString.deleteToodeID, [req.params.id]);
    await makeSqlQuery(sql,
        errorCodes.DELETE_TOODE_ERROR.code, 
        errorCodes.DELETE_TOODE_ERROR.message, 
        next);

    // Lisa lao muutustesse tabelisse rida
    sql = mysql.format(sqlString.insertTooteMuutus, [toode[0].nimetus, toode[0].hetke_kogus * -1, "kustutamine"]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.INSERT_TOOTE_MUUTUS_ERROR.code, 
        errorCodes.INSERT_TOOTE_MUUTUS_ERROR.message, 
        next);
};
module.exports.getTooted = async (req, next) => {
    let sql = mysql.format(sqlString.tootedAEG, [req.body.start, req.body.end]);
    return await makeSqlQuery(sql,
        errorCodes.GET_TOOTED_ERROR.code, 
        errorCodes.GET_TOOTED_ERROR.message, 
        next);
};
module.exports.getToodeteMuutused = async (req, next) => {
    let sql;
    if (req.params.page > 1) sql = sqlString.toodeteMuutused + ' LIMIT ' + (req.params.page * 50 - 50) + ', 50';
    else sql = sqlString.toodeteMuutused;
    return await makeSqlQuery(sql,
        errorCodes.GET_TOODETE_MUUTUSED_ERROR.code, 
        errorCodes.GET_TOODETE_MUUTUSED_ERROR.message, 
        next);
};
module.exports.getKasutajateMuutused = async (req, next) => {
    let sql;
    if (req.params.page > 1) sql = sqlString.kasutajateMuutused + ' LIMIT ' + (req.params.page * 50 - 50) + ', 50';
    else sql = sqlString.kasutajateMuutused;
    return await makeSqlQuery(sql,
        errorCodes.GET_KASUTAJATE_MUUTUSED_ERROR.code, 
        errorCodes.GET_KASUTAJATE_MUUTUSED_ERROR.message, 
        next);
};
module.exports.updateKasutaja = async (next, kasutaja, muutused) => {
    // Update kasutaja
    let sql = mysql.format(sqlString.updateKasutaja, [kasutaja.seisus, kasutaja.staatus, kasutaja.eesnimi, kasutaja.perenimi, kasutaja.volg, kasutaja.kinnitatud, kasutaja.id]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.UPDATE_KASUTAJA_ERROR.code, 
        errorCodes.UPDATE_KASUTAJA_ERROR.message, 
        next);

    // Sisesta muutus kasutajatesse
    sql = mysql.format(sqlString.staatusNimetusID, [kasutaja.staatus]);
    let nim = await sqlFun.makeSqlQuery(sql,
        errorCodes.GET_STAATUS_ERROR.code, 
        errorCodes.GET_STAATUS_ERROR.message, 
        next);
    sql = mysql.format(sqlString.insertKasutajaMuutus, [`${nim[0].nimetus} ${kasutaja.eesnimi} ${kasutaja.perenimi}`, "muutmine", muutused.join(", ")]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.code, 
        errorCodes.INSERT_KASUTAJA_MUUTUS_ERROR.message, 
        next)
};
module.exports.updateToode = async (next, toode) => {
    // Update toode
    let sql = mysql.format(sqlString.updateToode, [toode.kategooria, toode.nimetus, toode.uusKogus, toode.myygi_hind, toode.oma_hind, toode.id]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.UPDATE_TOODE_ERROR.code, 
        errorCodes.UPDATE_TOODE_ERROR.message, 
        next);
    console.log(`========== TOOTE ${toode.nimetus} ANDMEID MUUDETUD ==========`);

    // Sisesta koguse muutus lattu kui vaja
    if (toode.uusKogus - toode.vanaKogus !== 0) {
        sql = mysql.format(sqlString.insertTooteMuutus, [toode.nimetus, toode.uusKogus - toode.vanaKogus, "muutmine"]);
    	await sqlFun.makeSqlQuery(sql,
            errorCodes.INSERT_TOOTE_MUUTUS_ERROR.code, 
            errorCodes.INSERT_TOOTE_MUUTUS_ERROR.message, 
            next);
    }
};
module.exports.getToodeNimetusega = async (req, next) => {
    let sql = mysql.format(sqlString.getToodeNIM, [req.body.nimetus]);
    return await sqlFun.makeSqlQuery(sql,
        errorCodes.GET_TOODE_ERROR.code, 
        errorCodes.GET_TOODE_ERROR.message, 
        next);
};
module.exports.insertToode = async (next, toode) => {
    // Insert toode
    let sql = mysql.format(sqlString.insertToode, [toode.kategooria, toode.nimetus, toode.kogus, toode.myygi_hind, toode.oma_hind]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.INSERT_TOODE_ERROR.code, 
        errorCodes.INSERT_TOODE_ERROR.message, 
        next);

    // Sisesta toote lisamine lao muutustesse
    sql = mysql.format(sqlString.insertTooteMuutus, [toode.nimetus, toode.kogus, "lisamine"]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.INSERT_TOOTE_MUUTUS_ERROR.code, 
        errorCodes.INSERT_TOOTE_MUUTUS_ERROR.message, 
        next);
};

// ===============================================================
// ===============================================================
// ================== REGULAR CARD READ SQL FUN ==================
// ===============================================================
// ===============================================================
module.exports.kasutajaKaardiLugemisel = async (next, serial) => {
    let sql = mysql.format(sqlString.kasutajaSeisKinn, [serial]);

    return await sqlFun.makeSqlQuery(sql,
        errorCodes.GET_KASUTAJA_KAART_ERROR.code, 
        errorCodes.GET_KASUTAJA_KAART_ERROR.message, 
        next);
};
module.exports.kinnitaKasutaja = async (id, next) => {
    let sql = mysql.format(sqlString.updateKinnitatudKAARDIID, [id]);

    await sqlFun.makeSqlQuery(sql,
        errorCodes.KINNITA_KASUTAJA_ERROR.code, 
        errorCodes.KINNITA_KASUTAJA_ERROR.message, 
        next);

    sql = mysql.format(sqlString.kasutajaInfID, [id]);
    let kasutaja = await sqlFun.makeSqlQuery(sql,
        errorCodes.KASUTAJA_NIME_ERROR.code, 
        errorCodes.KASUTAJA_NIME_ERROR.message, 
        next);

    sql = mysql.format(sqlString.insertKasutajaMuutus, [`${kasutaja[0].nimetus} ${kasutaja[0].eesnimi} ${kasutaja[0].perenimi}`, "muutmine", "kinnitanud"]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.REGISTREERIMINE_INSERT_KASUTAJA_MUUTUS_ERROR.code, 
        errorCodes.REGISTREERIMINE_INSERT_KASUTAJA_MUUTUS_ERROR.message, 
        next);
};
module.exports.registreeriKasutaja = async (uusKasutaja, next) => {
    let sql = mysql.format(sqlString.insertKasutaja, [uusKasutaja.staatus, uusKasutaja.id, uusKasutaja.eesnimi, uusKasutaja.perenimi, uusKasutaja.coetus]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.INSERT_KASUTAJA_ERROR.code, 
        errorCodes.INSERT_KASUTAJA_ERROR.message, 
        next);

    sql = mysql.format(sqlString.staatusNimetusID, [uusKasutaja.staatus]);
    let staatus = await sqlFun.makeSqlQuery(sql,
        errorCodes.GET_STAATUS_REGISTREERIMINE_ERROR.code, 
        errorCodes.GET_STAATUS_REGISTREERIMINE_ERROR.message, 
        next);

    sql = mysql.format(sqlString.insertKasutajaMuutus, [`${staatus[0].nimetus} ${uusKasutaja.eesnimi} ${uusKasutaja.perenimi}`, "lisamine", "kõik"]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.REGISTREERIMINE_INSERT_KASUTAJA_MUUTUS_ERROR.code, 
        errorCodes.REGISTREERIMINE_INSERT_KASUTAJA_MUUTUS_ERROR.message, 
        next);
    return staatus[0].nimetus;
};

// =====================================================
// =====================================================
// ================== OSTMINE SQL FUN ==================
// =====================================================
// =====================================================
module.exports.getTootedJaKasutaja = async (id, next) => {
    let arr = [];
    let result = await sqlFun.makeSqlQuery(sqlString.toode1,
        errorCodes.SOOK_JOOK_ERROR.code, 
        errorCodes.SOOK_JOOK_ERROR.message, 
        next);
    arr.push(result);
    result = await sqlFun.makeSqlQuery(sqlString.toode2,
        errorCodes.SOOK_JOOK_ERROR.code, 
        errorCodes.SOOK_JOOK_ERROR.message, 
        next);
    arr.push(result);
    result = await sqlFun.makeSqlQuery(sqlString.toode3,
        errorCodes.SOOK_JOOK_ERROR.code, 
        errorCodes.SOOK_JOOK_ERROR.message, 
        next);
    arr.push(result);
    result = await sqlFun.makeSqlQuery(sqlString.toode4,
        errorCodes.SOOK_JOOK_ERROR.code, 
        errorCodes.SOOK_JOOK_ERROR.message, 
        next);
    arr.push(result);
    result = await sqlFun.makeSqlQuery(sqlString.toode5,
        errorCodes.SOOK_JOOK_ERROR.code, 
        errorCodes.SOOK_JOOK_ERROR.message, 
        next);
    arr.push(result);
    result = await sqlFun.makeSqlQuery(sqlString.toode6,
        errorCodes.SOOK_JOOK_ERROR.code, 
        errorCodes.SOOK_JOOK_ERROR.message, 
        next);
    arr.push(result);
    let sql = mysql.format(sqlString.kasutaja_seisID, [id]);
    result = await sqlFun.makeSqlQuery(sql,
        errorCodes.KASUTAJA_ERROR_OST.code, 
        errorCodes.KASUTAJA_ERROR_OST.message, 
        next);
    arr.push(result);
    return arr;
};
module.exports.kasutajadPaneKirja = async (id, next) => {
    let sql = mysql.format(sqlString.kasutajadPaneKirja, [id]);
    return await sqlFun.makeSqlQuery(sql,
        errorCodes.KASUTAJATE_ERROR_OST.code, 
        errorCodes.KASUTAJATE_ERROR_OST.message, 
        next);
};
module.exports.viimase12hKasutajad = async (id, next) => {
    let sql = mysql.format(sqlString.viimase12hKasutajad, [id]);
    return await sqlFun.makeSqlQuery(sql,
        errorCodes.VIIMASE_12H_KASUTAJATE_ERROR.code, 
        errorCodes.VIIMASE_12H_KASUTAJATE_ERROR.message, 
        next);
};
module.exports.myygiHindNim = async (toode, next) => {
    let sql = mysql.format(sqlString.myygiHindNIMETUS, [toode]);
    return await sqlFun.makeSqlQuery(sql,
        errorCodes.TOOTE_HINNA_ERROR.code, 
        errorCodes.TOOTE_HINNA_ERROR.message, 
        next);
};
module.exports.tooteKategooriaID = async (toode, next) => {
    let sql = mysql.format(sqlString.tooteKategooriaID, [toode]);
    return await sqlFun.makeSqlQuery(sql,
        errorCodes.TOOTE_KATEGOORIA_ERROR.code, 
        errorCodes.TOOTE_KATEGOORIA_ERROR.message, 
        next);
};
module.exports.volgStaatusID = async (id, next) => {
    let sql = mysql.format(sqlString.volgStaatusID, [id]);
    return await sqlFun.makeSqlQuery(sql,
        errorCodes.VÕLA_STAATUSE_ERROR.code, 
        errorCodes.VÕLA_STAATUSE_ERROR.message, 
        next);
};
module.exports.updateVolgID = async (id, volg, next) => {
    let sql = mysql.format(sqlString.updateVolgID, [volg, id]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.UPDATE_VOLG_ERROR.code, 
        errorCodes.UPDATE_VOLG_ERROR.message, 
        next);
};
module.exports.hetkeKogusNimetus = async (toode, next) => {
    let sql = mysql.format(sqlString.hetke_kogusNIMETUS, [toode]);
    result = await sqlFun.makeSqlQuery(sql,
        errorCodes.TOOTE_KOGUS_ERROR.code, 
        errorCodes.TOOTE_KOGUS_ERROR.message, 
        next);
};
module.exports.updateKogusNimetus = async (total, toode, next) => {
    let sql = mysql.format(sqlString.updateKogusNIMETUS, [total, toode]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.UPDATE_KOGUS_ERROR.code, 
        errorCodes.UPDATE_KOGUS_ERROR.message, 
        next);
};
module.exports.lisaOst = async (ost, reb, next) => {
    let sql = mysql.format(sqlString.lisaOst, [ost.nimi, ost.toode, ost.kogus, ost.summa, ost.tasuta, reb]);
    await sqlFun.makeSqlQuery(sql,
        errorCodes.INSERT_OST_ERROR.code, 
        errorCodes.INSERT_OST_ERROR.message, 
        next);
};

async function makeSqlQuery (sql, errCode, message, next) {
    let result;
    try {
        result = await database.query(sql)
    } catch (err) {
        console.log(err);
        let error = new Error(message);
        error.statusCode = errCode;
  	    next(error);
    }
    return result;
}

module.exports.makeSqlQuery = makeSqlQuery;