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
    let id = req.params.id;
    if (getIndexOfId(id) === -1) {
        req.flash("ERROR", "Selle kaardi sessioon on aegunud!", "/");
    } else {
	    next();
    }
};

middlewareObj.removeUser = id => {
    let pos = getIndexOfId(id);
    clearTimeout(middlewareObj.users[pos].timeout);
    removeAndLog(id);
    //console.log(middlewareObj.users);
};

module.exports = middlewareObj;

// ====================================================================

function removeAndLog(id) {
    let pos = getIndexOfId(id);
    middlewareObj.users.splice(pos, 1);
    console.log("Timeout removed for " + String(id));
    //console.log(middlewareObj.users);	  
}

function addUserWithTimeout(id) {
    middlewareObj.users.push({
	    id: id,
	    timeout: setTimeout(removeAndLog.bind(null, id), 180000)
    });
    //console.log(middlewareObj.users);
}

function getIndexOfId(id) {
    for (let i = 0; i < middlewareObj.users.length; i++) {
	if (middlewareObj.users[i].id === id) {
	    return i;
	} 
    }
    return -1;
}
