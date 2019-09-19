let database    = require("../middleware/database"),
    mysql       = require("mysql"),
    sqlString   = require("../middleware/sqlString");

module.exports.getOstjadTop = async (req) => {
    try {
        var result = await database.query(sqlString.topOstjad);
    } catch(err) {
        req.flash("ERROR", "Andmebaasist kasutajate saamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    return result;
};

module.exports.getTootedTop = async (req) => {
    try {
        var result = await database.query(sqlString.topTooted);
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
        var result = await database.query(sqlString.joogid);
    } catch(err) {
        req.flash("ERROR", "Andmebaasist jookide saamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    return result;
};

module.exports.getSoogid = async (req) => {
    try {
        var result = await database.query(sqlString.soogid);
    } catch(err) {
        req.flash("ERROR", "Andmebaasist söökide saamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    return result;
};

module.exports.getOstud = async (req) => {
    let sql = mysql.format(sqlString.ostud);
    try {
        var result = await database.query(sql);
    } catch(err) {
        req.flash("ERROR", "Andmebaasist ostude saamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    return result;
};

module.exports.getVolad = async (req) => {
    try {
        var result = await database.query(sqlString.volad);
    } catch(err) {
        req.flash("ERROR", "Andmebaasist võlgade saamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    return result;
};

module.exports.nulliVolad = async (req) => {
    try {
        var result = await database.query(sqlString.nulliVolad);
    } catch(err) {
        req.flash("ERROR", "Andmebaasist võlgade nullimisega tekkis viga", "/admin");
        throw new Error(err);
    }
    console.log("========== NULLI VÕLAD ==========");
    console.log(result.message);
    return result;
};
module.exports.deleteKasutaja = async (req) => {
    let sql = mysql.format(sqlString.deleteKasutajaID, [req.params.id]);
    try {
        await database.query(sql)
    } catch(err) {
        req.flash("ERROR", "Kasutaja kustutamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    console.log("========== Kasutaja kustutatud ==========");
};

module.exports.deleteToode = async (req) => {
    let sql = mysql.format(sqlString.deleteToodeID, [req.params.id]);
    try {
        await database.query(sql)
    } catch(err) {
        req.flash("ERROR", "Toote kustutamisega tekkis viga", "/admin");
        throw new Error(err);
    }
    console.log("========== Kasutaja kustutatud ==========");
};