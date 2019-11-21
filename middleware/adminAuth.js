let errorCodes = require("./errorCodes");

let middlewareObj = {};

middlewareObj.IPs = [];

// Kasutaja ip lisamine andmebaasi
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

// Kasutaja ip arrays kontrollimine
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

// Kasutaja ip kustutamine arrayst
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

let getIndexOfIp = ip => middlewareObj.IPs.findIndex(elem => elem.ip === ip);