let database    = require("./databaseConnection"),
    errorCodes  = require("../errorCodes");

module.exports.makeSqlQuery = async (sql, errCode, message, next) => {
    let result;
    try {
        result = await database.query(sql);
        return result;
    } catch (err) {
        //console.log(err);
        let error = new Error(message);
        if (err.code === "ER_DUP_ENTRY") error.statusCode = errorCodes.ER_DUP_ENTRY_TOODE.code;
        else error.statusCode = errCode;
        next(error);
    }
    return -1;
}