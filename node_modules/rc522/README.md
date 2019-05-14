#RFID RC522 on Raspberry PI with NodeJS
node.js module to access a rfid reader with rc522 chipset which is connected a raspberry pi

##Fork of
This is a fork with added functionality. For a nice and simpler module please see the original https://www.npmjs.com/package/rc522-rfid https://github.com/sbrinkmann/rc522-rfid and adjustment of https://github.com/SebastianPozoga/rc522-rfid

## Purpose
This node module is to access RFID reader with a rc522 chipset (e.g. http://amzn.com/B00GYR1KJ8) via GPIO interface of the raspberry pi.

## Functionality
The module is currently only able to read the serial number of the tag which is hold onto the reader.

## Installation

## 1. Install node:
```
curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -
sudo apt-get install -y nodejs
```

## 2. Update your PI:
``` 
sudo apt-get update
sudo apt-get upgrade
sudo apt-get dist-upgrade
sudo rpi-update
sudo apt-get clean
```

## 3. Configure the PI:

The RFID reader is plugged onto the raspberry pi like it is described over here http://geraintw.blogspot.de/2014/01/rfid-and-raspberry-pi.html
- The GCC compiler is installed ```sudo apt-get install build-essential```
- node-gyp is installed ```sudo npm install -g node-gyp```

## 4. Compile the spi_bcm2835 driver:
First of all we have to install the C library for Broadcom BCM 2835 as it describe` here
```
wget http://www.airspayce.com/mikem/bcm2835/bcm2835-1.49.tar.gz
tar -zxf bcm2835-1.49.tar.gz
cd bcm2835-1.49
./configure
make
sudo make check
sudo make install
sudo modprobe spi_bcm2835
```

## 5. Make a node project
```
cd ~/
mkdir RFID
cd RFID/
npm install --save rc522
nano rfid.js
```

Put this into:

```
var rc522 = require("rc522");

console.log('Ready!!!');

rc522(function(rfidSerialNumber){
	console.log(rfidSerialNumber);
});
```

Save and run: (Is necessary "sudo")

```
sudo node rfid.js
```


NOTE: Running as root

```
Prior to the release of Raspbian Jessie in Feb 2016, access to any peripheral device via /dev/mem on the RPi required the process to run as root. Raspbian Jessie permits non-root users to access the GPIO peripheral (only) via /dev/gpiomem, and this library supports that limited mode of operation.

If the library runs with effective UID of 0 (ie root), then bcm2835_init() will attempt to open /dev/mem, and, if successful, it will permit use of all peripherals and library functions.

If the library runs with any other effective UID (ie not root), then bcm2835_init() will attempt to open /dev/gpiomem, and, if successful, will only permit GPIO operations. In particular, bcm2835_spi_begin() and bcm2835_i2c_begin() will return false and all other non-gpio operations may fail silently or crash.
```