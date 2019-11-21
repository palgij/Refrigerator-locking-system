#!/usr/bin/env python

from time import sleep
import sys
from mfrc522 import SimpleMFRC522
import RPi.GPIO as GPIO

GPIO.setwarnings(False)

reader = SimpleMFRC522()

led = 33
summer = 40
GPIO.setmode(GPIO.BOARD)


id = reader.read_id()
GPIO.setup(led, GPIO.OUT)
GPIO.setup(summer, GPIO.OUT)
sleep(0.05)
GPIO.cleanup()
print(id)
sys.stdout.flush()
sys.exit(0)