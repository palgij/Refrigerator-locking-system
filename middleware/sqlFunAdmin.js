let database    = require("../middleware/database"),
    mysql       = require("mysql"),
    sqlString   = require("../middleware/sqlString");

module.exports.getOstjadTop = async (req) => {
    try {
        var result = await database.query(sqlString.topOstjad)
    } catch(err) {
        req.flash("ERROR", "Andmebaasist kasutajate saamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    return result;
};

module.exports.getTootedTop = async (req) => {
    try {
        var result = await database.query(sqlString.topTooted)
    } catch(err) {
        req.flash("ERROR", "Andmebaasist toodete saamisega tekkis viga", "/admin");
        throw new Error(err)
    }
    return result;
};

module.exports.getKasutajad = async (req) => {
    try {
        var result = await database.query(sqlString.kasutajad)
    } catch(err) {
        req.flash("ERROR", "Andmebaasist kasutajate saamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    return result;
};

module.exports.getKasutaja = async (id, req) => {
    let sql = mysql.format(sqlString.kasutajaID, [id]);
    try {
        var result = await database.query(sql)
    } catch(err) {
        req.flash("ERROR", "Andmebaasist kasutaja saamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    return result;
};

module.exports.getToode = async (id, req) => {
    let sql = mysql.format(sqlString.toodeID, [id]);
    try {
        var result = await database.query(sql)
    } catch(err) {
        req.flash("ERROR", "Andmebaasist toote saamisega tekkis viga", "/admin");
        throw new Error(err)
    }
    return result;
};

module.exports.getJoogid = async (req) => {
    try {
        var result = await database.query(sqlString.joogid)
    } catch(err) {
        req.flash("ERROR", "Andmebaasist jookide saamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    return result;
};

module.exports.getSoogid = async (req) => {
    try {
        var result = await database.query(sqlString.soogid)
    } catch(err) {
        req.flash("ERROR", "Andmebaasist söökide saamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    return result;
};

module.exports.getOstud = async (req) => {
    let sql = mysql.format(sqlString.ostud);
    try {
        var result = await database.query(sql)
    } catch(err) {
        req.flash("ERROR", "Andmebaasist söökide saamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    return result;
};

module.exports.getVolad = async (req) => {
    try {
        var result = await database.query(sqlString.volad)
    } catch(err) {
        req.flash("ERROR", "Andmebaasist võlgade saamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    return result;
};