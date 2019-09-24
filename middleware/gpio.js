let rpio = require("rpio");

let opened = false;

module.exports.ring = () => {
    rpio.open(40, rpio.OUTPUT, rpio.HIGH);
    rpio.open(33, rpio.OUTPUT, rpio.HIGH);
    rpio.msleep(50);
    rpio.close(33);
    rpio.close(40);
};

module.exports.lockOpen = () => {
    rpio.open(7, rpio.OUTPUT, rpio.LOW);
    setTimeout( () => {
        rpio.close(7);
    }, 10000);
};

module.exports.toggleLock = () => {
    if (!opened) {
	rpio.open(7, rpio.OUTPUT, rpio.LOW);
	opened = true;
    } else {
	rpio.close(7);
	opened = false;
    }
};