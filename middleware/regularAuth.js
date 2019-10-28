let errorCodes = require("./errorCodes");

var middlewareObj = {};

middlewareObj.users = [];

middlewareObj.getUsers = id => {
    return middlewareObj.users[getIndexOfId(id)];
};

middlewareObj.addUserCard = id => {
    let pos = getIndexOfId(id);
    if (pos === -1) {
	addUserWithTimeout(id);
    } else {
	    clearTimeout(middlewareObj.users[pos].timeout);
	    removeAndLog(id);
	    addUserWithTimeout(id);
    }
};

middlewareObj.checkUserSessionValid = (req, res, next) => {
    let id;
    if (req.params.id.includes('"')) {
	let arr = req.params.id.split('"');
	id = arr[0];
    } else id = req.params.id;

    if (getIndexOfId(id) === -1) {
        let err = new Error(errorCodes.KAARDI_SESSIOON_AEGUNUD.message);
        err.statusCode = errorCodes.KAARDI_SESSIOON_AEGUNUD.code;
        next(err);
    } else {
	next();
    }
};

middlewareObj.removeUser = id => {
    let pos = getIndexOfId(id);
    clearTimeout(middlewareObj.users[pos].timeout);
    removeAndLog(id);
};

module.exports = middlewareObj;

// ====================================================================

function removeAndLog(id) {
    let pos = getIndexOfId(id);
    middlewareObj.users.splice(pos, 1);
    console.log("Timeout removed for " + String(id));
}

function addUserWithTimeout(id) {
    middlewareObj.users.push({
	    id: id,
	    timeout: setTimeout(removeAndLog.bind(null, id), 180000)
    });
}

function getIndexOfId(id) {
    for (let i = 0; i < middlewareObj.users.length; i++) {
	    if (middlewareObj.users[i].id === id) {
	        return i;
	    }
    }
    return -1;
}
