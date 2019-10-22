let errorCodes = require("./errorCodes");

let middlewareObj = {};

middlewareObj.IPs = [];

middlewareObj.addIp = ip => {
    let pos = getIndexOfIp(ip);
    if (pos === -1) {
        addIpWithTimeout(ip);
    } else {
        clearTimeout(middlewareObj.IPs[pos].timeout);
        removeAndLog(ip, false);
        addIpWithTimeout(ip, true);
    }
};

middlewareObj.checkIpSessionValid = (req, res, next) => {
    let ip = req.clientIp;
    if (getIndexOfIp(ip) === -1) {
        let err = new Error(errorCodes.IP_SESSIOON_AEGUNUD.message);
        err.statusCode = errorCodes.IP_SESSIOON_AEGUNUD.code;
        next(err);
    } else {
	    clearTimeout(middlewareObj.IPs[getIndexOfIp(ip)].timeout);
	    removeAndLog(ip, false);
	    addIpWithTimeout(ip, false);
	    next();
    }
};

middlewareObj.removeIp = (req, res, next) => {
    let ip = req.clientIp;
    let pos = getIndexOfIp(ip);
    if (pos !== -1) {
 	    clearTimeout(middlewareObj.IPs[pos].timeout);
    	removeAndLog(ip, true);
    }
    next();
};

module.exports = middlewareObj;

// ====================================================================

function removeAndLog(ip, log) {
    let pos = getIndexOfIp(ip);
    middlewareObj.IPs.splice(pos, 1);
    if(log) {
      	console.log("Timeout removed for " + String(ip)); 
    } 
}

function addIpWithTimeout(ip, log) {
    middlewareObj.IPs.push({
	    ip: ip,
	    timeout: setTimeout(removeAndLog.bind(null, ip, true), 300000)
    });
    if (log) {
	    console.log("Timeout added for " + String(ip));
    }
}

function getIndexOfIp(ips) {
    let index = middlewareObj.IPs.findIndex(ip => ip === ips);
    /*for (let i = 0; i < middlewareObj.IPs.length; i++) {
	    if (middlewareObj.IPs[i].ip === ip) {
	        return i;
	    }
    }*/
    return index;
}