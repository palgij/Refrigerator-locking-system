let errorCodes = require("../errorCodes");

let middlewareObj = {};

middlewareObj.IPs = [];

// Kasutaja ip lisamine andmebaasi
middlewareObj.addIp = ip => {
    let pos = getIndexOfIp(ip);
    if (pos === -1) {
        addIpWithTimeout(ip);
    } else {
        clearTimeout(middlewareObj.IPs[pos].timeout);
        removeAndLog(ip);
        addIpWithTimeout(ip);
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
        removeAndLog(ip);
        addIpWithTimeout(ip);
        next();
    }
};

// Kasutaja ip kustutamine arrayst
middlewareObj.removeIp = (req, res, next) => {
    let ip = req.clientIp;
    let pos = getIndexOfIp(ip);
    if (pos !== -1) {
        clearTimeout(middlewareObj.IPs[pos].timeout);
        removeAndLog(ip);
    }
    next();
};

module.exports = middlewareObj;

// ====================================================================

function removeAndLog(ip) {
    let pos = getIndexOfIp(ip);
    middlewareObj.IPs.splice(pos, 1);
}

function addIpWithTimeout(ip) {
    middlewareObj.IPs.push({
        ip      : ip,
        timeout : setTimeout(removeAndLog.bind(null, ip, true), 300000)
    });
}

let getIndexOfIp = ip => middlewareObj.IPs.findIndex(elem => elem.ip === ip);