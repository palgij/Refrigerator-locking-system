let database    = require("../middleware/database"),
    mysql       = require("mysql"),
    sqlString   = require("../middleware/sqlString");

module.exports.getOstjadTop = async (req) => {
    return await makeSqlQuery(sqlString.topOstjad, "/admin", "Andmebaasist kasutajate saamisega tekkis viga", req);
};

module.exports.getTootedTop = async (req) => {
    return await makeSqlQuery(sqlString.topTooted, "/admin", "Andmebaasist toodete saamisega tekkis viga", req);
};

module.exports.getKasutajad = async (req) => {
    return await makeSqlQuery(sqlString.kasutajad, "/admin", "Andmebaasist kasutajate saamisega tekkis viga", req);
};

module.exports.getKasutaja = async (id, req) => {
    let sql = mysql.format(sqlString.kasutajaID, [id]);
    return await makeSqlQuery(sql, "/admin", "Andmebaasist kasutaja saamisega tekkis viga", req);
};

module.exports.getToode = async (id, req) => {
    let sql = mysql.format(sqlString.toodeID, [id]);
    return await makeSqlQuery(sql, "/admin", "Andmebaasist toote saamisega tekkis viga", req);
};

module.exports.getJoogid = async (req) => {
    return await makeSqlQuery(sqlString.joogid, "/admin", "Andmebaasist jookide saamisega tekkis viga", req);
};

module.exports.getSoogid = async (req) => {
    return await makeSqlQuery(sqlString.soogid, "/admin", "Andmebaasist söökide saamisega tekkis viga", req);
};

module.exports.getOstud = async (req) => {
    let sql;
    if (req.params.page) sql = sqlString.ostud + ' LIMIT ' + (req.params.page * 50);
    else sql = sqlString.ostud;
    return await makeSqlQuery(sql, "/admin", "Andmebaasist ostude saamisega tekkis viga", req);
};

module.exports.getVolad = async (req) => {
    return await makeSqlQuery(sqlString.volad, "/admin", "Andmebaasist võlgade saamisega tekkis viga", req);
};

module.exports.nulliVolad = async (req) => {
    console.log("========== NULLI VÕLAD ==========");
    let result = await makeSqlQuery(sqlString.nulliVolad, "/admin", "Andmebaasis võlgade nullimisega tekkis viga", req);
    console.log(result.message);
    return result;
};
module.exports.deleteKasutaja = async (req) => {
    let sql = mysql.format(sqlString.deleteKasutajaID, [req.params.id]);
    await makeSqlQuery(sql, "/admin", "Kasutaja kustutamisega tekkis viga", req);
    console.log("========== Kasutaja kustutatud ==========");
};

module.exports.deleteToode = async (req) => {
    let sql = mysql.format(sqlString.deleteToodeID, [req.params.id]);
    await makeSqlQuery(sql, "/admin", "Toote kustutamisega tekkis viga", req);
    console.log("========== Toode kustutatud ==========");
};

module.exports.makeSqlQuery = async (sql, errorUrl, message, req) => {
    let result;
    try {
        result = await database.query(sql)
    } catch (err) {
        req.flash("ERROR", message, errorUrl);
        throw new Error(err);
    }
    return result;
};