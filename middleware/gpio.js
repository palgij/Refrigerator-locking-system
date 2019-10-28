let rpio = require("rpio");

let opened = false;
let locked = undefined;

module.exports.ring = () => {
    rpio.open(40, rpio.OUTPUT, rpio.HIGH);
    rpio.open(33, rpio.OUTPUT, rpio.HIGH);
    rpio.msleep(50);
    rpio.close(33);
    rpio.close(40);
};

module.exports.lockOpen = () => {
    rpio.open(7, rpio.OUTPUT, rpio.LOW);
    if (locked === undefined) {
    	locked = setTimeout(() => {
            rpio.close(7);
	    locked = undefined;
    	}, 10000);
    } else {
	clearTimeout(locked);
	locked = setTimeout(() => {
            rpio.close(7);
	    locked = undefined;
    	}, 10000);
    }
};

module.exports.toggleLock = () => {
    if (!opened) {
	rpio.open(7, rpio.OUTPUT, rpio.LOW);
	opened = true;
	console.log("========== LUKK AVATUD ==========");
    } else {
	rpio.close(7);
	opened = false;
	console.log("========== LUKK SULETUD ==========");
    }
};