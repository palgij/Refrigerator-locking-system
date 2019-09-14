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
        req.flash("ERROR", "Selle IP sessioon on aegunud!", "/admin");
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
    	//console.log(middlewareObj.IPs);
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
    //console.log(middlewareObj.IPs); 
}

function addIpWithTimeout(ip, log) {
    middlewareObj.IPs.push({
	    ip: ip,
	    timeout: setTimeout(removeAndLog.bind(null, ip, true), 300000)
    });
    if (log) {
	    console.log("Timeout added for " + String(ip));
    }
    //console.log(middlewareObj.IPs); 
}

function getIndexOfIp(ip) {
    middlewareObj.IPs.forEach((index) => {
        if (middlewareObj.IPs[index].ip === ip) return index;
    });
    return -1;
}