
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

htriggers.init = function() {

    var lcd = new five.LCD({
        controller: _settingsConfig.hw.lcd.id
    });

    btnLength = Object.keys(_settingsConfig.hw.button).length;
    ledLength = Object.keys(_settingsConfig.hw.led).length;
    sensLength = Object.keys(_settingsConfig.hw.sensor).length;
    relayLength = Object.keys(_settingsConfig.hw.relay).length;

    if (btnLength > 0) {
        for(i=0; i < btnLength; i++) {
            eval("htriggers.obutton." + _settingsConfig.hw.button[i].obj + "={};");
            eval("htriggers.obutton." + _settingsConfig.hw.button[i].obj + ".obj=new mraa.Gpio(_settingsConfig.hw.button[i].pin);");
            eval("htriggers.obutton." + _settingsConfig.hw.button[i].obj + ".name='" + _settingsConfig.hw.button[i].pname + "';");
            eval("htriggers.obutton." + _settingsConfig.hw.button[i].obj + ".pin='" + _settingsConfig.hw.button[i].pin + "';");
        }
    }

    if (ledLength > 0) {
        for(i=0; i < ledLength; i++) {
            eval("htriggers.oled." + _settingsConfig.hw.led[i].obj + "={};");
            eval("htriggers.oled." + _settingsConfig.hw.led[i].obj + ".obj=new five.Led(_settingsConfig.hw.led[i].pin);");
            eval("htriggers.oled." + _settingsConfig.hw.led[i].obj + ".name='" + _settingsConfig.hw.led[i].pname + "';");
            eval("htriggers.oled." + _settingsConfig.hw.led[i].obj + ".pin='" + _settingsConfig.hw.led[i].pin + "';");
        }
    }

    if (sensLength > 0) {

        for(i=0; i < sensLength; i++) {

            if (_settingsConfig.hw.sensor[i].type != undefined) {

                if (_settingsConfig.hw.sensor[i].type == "five-piezo") {

                    eval("htriggers.osensor." + _settingsConfig.hw.sensor[i].obj + "={};");
                    eval("htriggers.osensor." + _settingsConfig.hw.sensor[i].obj + ".name='" + _settingsConfig.hw.sensor[i].pname + "';");
                    eval("htriggers.osensor." + _settingsConfig.hw.sensor[i].obj + ".pin='" + _settingsConfig.hw.sensor[i].pin + "';");
                    eval("htriggers.osensor." + _settingsConfig.hw.sensor[i].obj + ".obj=new five.Piezo(_settingsConfig.hw.sensor[i].pin);");

                }

            }

        }

    }

    if (relayLength > 0) {
        for(i=0; i < relayLength; i++) {
            console.log(_settingsConfig.hw.relay[i].obj);
            eval("htriggers.orelay." + _settingsConfig.hw.relay[i].obj + "={};");
            eval("htriggers.orelay." + _settingsConfig.hw.relay[i].obj + ".obj=new five.Relay(_settingsConfig.hw.relay[i].pin);");
            eval("htriggers.orelay." + _settingsConfig.hw.relay[i].obj + ".name='" + _settingsConfig.hw.relay[i].pname + "';");
            eval("htriggers.orelay." + _settingsConfig.hw.relay[i].obj + ".pin='" + _settingsConfig.hw.relay[i].pin + "';");
        }
    }

    htriggers.olcd = lcd;
    htriggers.icon('check');
    htriggers.icon('heart');
    htriggers.icon('duck');

    return this;

}

htriggers.icon = function(icon) {
    htriggers.olcd.useChar(icon);
}

htriggers.lcd = {};
htriggers.lcd.write = function(line, position, message) {
    console.log(line + " " + position + " " + message);
    htriggers.olcd.cursor(line, position).print(message);
}

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

htriggers.led = {};
htriggers.led.blink = function(led) {
    led.obj.blink(1000);
}
htriggers.led.on = function(led) {
    //console.log(htriggers.oled.blue);
    led.obj.on();
}
htriggers.led.off = function(led) {
    led.obj.off();
}
htriggers.led.stop = function(led) {
    led.obj.stop();
}


module.exports = htriggers;
