var async = require('async');
var mraa = require("mraa");
var five = require("johnny-five");
var edison = require("galileo-io");
var board = new five.Board({
    io: new edison()
});

htriggers = {};
htriggers.olcd = false;
htriggers.obutton = {};
htriggers.oled = {};
htriggers.osensor = {};
htriggers.orelay = {};

htriggers.queue = {};
htriggers.queue.list = [];
htriggers.queue.states = [];

var asyncTriggers = [];

htriggers.init = function() {

    btnLength = Object.keys(_settingsConfig.hw.button).length;
    ledLength = Object.keys(_settingsConfig.hw.led).length;
    sensLength = Object.keys(_settingsConfig.hw.sensor).length;
    relayLength = Object.keys(_settingsConfig.hw.relay).length;
    lcdLength = Object.keys(_settingsConfig.hw.lcd.id).length;

    if (lcdLength > 0) {

        asyncTriggers.push(async.apply(function(id, callback){

            console.log(id);

            var lcd = new five.LCD({
                controller: id
            });

            htriggers.olcd = lcd;

        },_settingsConfig.hw.lcd.id));

    }
/*
    if (btnLength > 0) {

        for(i=0; i < btnLength; i++) {

            eval("htriggers.obutton." + _settingsConfig.hw.button[i].obj + "={};");
            eval("htriggers.obutton." + _settingsConfig.hw.button[i].obj + ".obj=false;");
            eval("htriggers.obutton." + _settingsConfig.hw.button[i].obj + ".name='" + _settingsConfig.hw.button[i].pname + "';");
            eval("htriggers.obutton." + _settingsConfig.hw.button[i].obj + ".pin='" + _settingsConfig.hw.button[i].pin + "';");

            buttonPIN = _settingsConfig.hw.button[i].pin;

            asyncTriggers.push(function(callback){
                eval("htriggers.obutton." + _settingsConfig.hw.button[i].obj + ".obj=new mraa.Gpio(buttonPIN);");
            });

        }

    }

    if (ledLength > 0) {

        for(i=0; i < ledLength; i++) {

            eval("htriggers.oled." + _settingsConfig.hw.led[i].obj + "={};");
            eval("htriggers.oled." + _settingsConfig.hw.led[i].obj + ".obj=false;");
            eval("htriggers.oled." + _settingsConfig.hw.led[i].obj + ".name='" + _settingsConfig.hw.led[i].pname + "';");
            eval("htriggers.oled." + _settingsConfig.hw.led[i].obj + ".pin='" + _settingsConfig.hw.led[i].pin + "';");

            ledPIN = _settingsConfig.hw.led[i].pin;

            asyncTriggers.push(function(callback){
                eval("htriggers.oled." + _settingsConfig.hw.led[i].obj + ".obj=new five.Led(ledPIN);");
            });

        }

    }

    if (sensLength > 0) {

        for(i=0; i < sensLength; i++) {

            if (_settingsConfig.hw.sensor[i].type != undefined) {

                if (_settingsConfig.hw.sensor[i].type == "five-piezo") {

                    eval("htriggers.osensor." + _settingsConfig.hw.sensor[i].obj + "={};");
                    eval("htriggers.osensor." + _settingsConfig.hw.sensor[i].obj + ".obj=false;");
                    eval("htriggers.osensor." + _settingsConfig.hw.sensor[i].obj + ".name='" + _settingsConfig.hw.sensor[i].pname + "';");
                    eval("htriggers.osensor." + _settingsConfig.hw.sensor[i].obj + ".pin='" + _settingsConfig.hw.sensor[i].pin + "';");

                    sensorPIN = _settingsConfig.hw.sensor[i].pin;

                    asyncTriggers.push(function(callback){
                        eval("htriggers.osensor." + _settingsConfig.hw.sensor[i].obj + ".obj=new five.Piezo(sensorPIN);");
                    });

                }

            }

        }

    }

    if (relayLength > 0) {

        for(i=0; i < relayLength; i++) {

            relayPin = _settingsConfig.hw.relay[i].pin;
            relayName = _settingsConfig.hw.relay[i].pname;

            eval("htriggers.orelay." + _settingsConfig.hw.relay[i].obj + "={};");
            eval("htriggers.orelay." + _settingsConfig.hw.relay[i].obj + ".obj=false;");
            eval("htriggers.orelay." + _settingsConfig.hw.relay[i].obj + ".name='" + relayName + "';");
            eval("htriggers.orelay." + _settingsConfig.hw.relay[i].obj + ".pin='" + relayPin + "';");

            asyncTriggers.push(function(relayName, relayPin){
                eval("htriggers.orelay." + _settingsConfig.hw.relay[i].obj + ".obj=new five.Relay(relayPIN);");
            });

        }

    }

    asyncTriggers.push(function(callback){

        htriggers.icon('check');
        htriggers.icon('heart');
        htriggers.icon('duck');

    });
    */
    async.waterfall(asyncTriggers);

    return this;

}

// usefull functions

htriggers.icon = function(icon) {
    htriggers.olcd.useChar(icon);
}

// - LCD
htriggers.lcd = {};
htriggers.lcd.write = function(line, position, message) {
    console.log(line + " " + position + " " + message);
    htriggers.olcd.cursor(line, position).print(message);
}

// - BUTTON
htriggers.button = {};
htriggers.button.flow = function(button, checkPressTime, press, release) {

    button.obj.dir(mraa.DIR_IN);

    init=0;

    function readDataButton(button, htriggers) {

        bval = button.obj.read();

        if (bval==0 && init==1 && button.pressed) {
            init=0;
            release(button, htriggers);
        }

        if (bval==1) {
            init=1;
            button.pressed = true;
            press(button, htriggers);
        }

    }

    htriggers.queue.list[button.name] = setInterval(function(){
        readDataButton(button, htriggers);
    }, checkPressTime);

}

// - LED
htriggers.led = {};
htriggers.led.blink = function(led) {
    led.obj.blink(1000);
}
htriggers.led.on = function(led) {
    led.obj.on();
}
htriggers.led.off = function(led) {
    led.obj.off();
}
htriggers.led.stop = function(led) {
    led.obj.stop();
}

module.exports = htriggers;