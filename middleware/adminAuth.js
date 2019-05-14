var middlewareObj = {};

middlewareObj.IPs = [];

middlewareObj.addIp = function(ip) {
    var pos = getIndexOfIp(ip);

    if (pos === -1) {
	addIpWithTimeout(ip);
    } else {
	clearTimeout(middlewareObj.IPs[pos].timeout);
	removeAndLog(ip, false);
	addIpWithTimeout(ip, true);
    }
}

middlewareObj.checkIpSessionValid = function(req, res, next) {
    var ip = req.clientIp;
    if (getIndexOfIp(ip) === -1) {
	 req.flash("ERROR", "Selle IP sessioon on aegunud!", "/admin");
    } else {
	clearTimeout(middlewareObj.IPs[getIndexOfIp(ip)].timeout);
	removeAndLog(ip, false);
	addIpWithTimeout(ip, false);
	next();
    }
}

middlewareObj.removeIp = function(req, res, next) {
    var ip = req.clientIp;
    var pos = getIndexOfIp(ip);
    if (pos !== -1) {
 	clearTimeout(middlewareObj.IPs[pos].timeout);
    	removeAndLog(ip, true);
    	//console.log(middlewareObj.IPs);
    }
    next();
}

module.exports = middlewareObj;

// ====================================================================

function removeAndLog(ip, log) {
    var pos = getIndexOfIp(ip);

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
    for (var i = 0; i < middlewareObj.IPs.length; i++) {
	if (middlewareObj.IPs[i].ip === ip) {
	    return i;
	} 
    } 
    return -1;
}