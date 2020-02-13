let errorCodes = require("../errorCodes"),
    crypto     = require("../crypto");

var middlewareObj = {};

middlewareObj.users = [];

middlewareObj.getUsers = id => middlewareObj.users[getIndexOfId(crypto.decrypt(id))];

// Lisa kasutaja kaardi id arraysse
middlewareObj.addUserCard = id => {
    id = crypto.decrypt(id);
    let pos = getIndexOfId(id);
    if (pos === -1) {
        addUserWithTimeout(id);
    } else {
        clearTimeout(middlewareObj.users[pos].timeout);
        removeAndLog(id);
        addUserWithTimeout(id);
    }
};

// Kontrolli kas kasutaja kaardi id on ikka arrays
middlewareObj.checkUserSessionValid = (req, res, next) => {
    let id;
    if (req.params.id.includes('"')) {
        let arr = req.params.id.split('"');
        id = crypto.decrypt(arr[0]);
    } else id = crypto.decrypt(req.params.id);    

    if (getIndexOfId(id) === -1) {
        let err = new Error(errorCodes.KAARDI_SESSIOON_AEGUNUD.message);
        err.statusCode = errorCodes.KAARDI_SESSIOON_AEGUNUD.code;
        next(err);
    } else {
        next();
    }
};

// Kustuta kasutaja kaardi id arrayst
middlewareObj.removeUser = id => {
    id = crypto.decrypt(id);
    let pos = getIndexOfId(id);
    if (pos !== -1) {
        clearTimeout(middlewareObj.users[pos].timeout);
        removeAndLog(id);
    }
    crypto.clearCryptedTextTimeoutAndRemoveIt(id);
};

module.exports = middlewareObj;

// ====================================================================

let removeAndLog = id => {
    let pos = getIndexOfId(id);
    middlewareObj.users.splice(pos, 1);
}

let addUserWithTimeout = id => {
    middlewareObj.users.push({
        id      : id,
        timeout : setTimeout(removeAndLog.bind(null, id), 180000)
    });
}

let getIndexOfId = id => middlewareObj.users.findIndex(elem => elem.id === id);
