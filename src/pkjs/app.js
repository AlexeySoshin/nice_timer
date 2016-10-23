/**
 * Nice Timer for Pebble Smartwatch
 *
 * @author Alexey Soshin
 */

var UI = require('ui');
var Vector2 = require('vector2');
var Feature = require('platform/feature');
var vibe = require('ui/vibe');


var radialColor = "orange";
var radialRadius = 10;

var STOPPED = "stopped";
var STARTED = "started";
var PAUSED = "paused";

var PAUSE_IMAGE = "images/pause.png";
var PLAY_IMAGE = "images/play.png";
var RESET_IMAGE = "images/reset.png";

var MAIN_BACKGROUND_COLOR = 'black';

var timers = [
    {
        status:   STOPPED,
        seconds:  10,
        interval: null
    },
    {
        status:   STOPPED,
        seconds:  30,
        interval: null
    },
    {
        status:   STOPPED,
        seconds:  60,
        interval: null
    }];

showMenu();

function showMenu() {

    //TODO generate based on @timers
    var menu = new UI.Menu({

        sections: [{
            items: [{
                title: '10 seconds',
                subtitle: '00:10'
                //TODO icons
            }, {
                title: '30 seconds',
                subtitle: '00:30'
            }, {
                title: '1 minute',
                subtitle: '01:00'
            }]
        }]
    });
    var selected = null;
    menu.on('select', function (e) {
        if (selected) {
            selected.item.icon = '';
        }
        //    e.item.icon = 'images/menu_icon.png';
        selected = e;
        showTimer(timers[e.itemIndex]);
    });
    menu.show();
}

function getBackgroundRadial(width) {
    return new UI.Radial({
        size:            new Vector2(width, width),
        angle:           0,
        angle2:          360,
        radius:          radialRadius / 2,
        backgroundColor: '#AAAAAA',
        borderColor:     MAIN_BACKGROUND_COLOR,
        borderWidth:     0
    });
}

function getCountdownText(width, secondsToRun) {
    return new UI.Text({
        size:      new Vector2(width, 60),
        font:      'bitham-42-bold',
        text:      secondsToRun,
        textAlign: 'center'
    });
}

function getRadial(width, radialStart) {
    return new UI.Radial({
        size:            new Vector2(width, width),
        angle:           0,
        angle2:          radialStart,
        radius:          radialRadius,
        backgroundColor: radialColor,
        borderColor:     MAIN_BACKGROUND_COLOR,
        borderWidth:     0
    });
}

function showTimer(timer) {

    var secondsToRun = timer.seconds;

    var tickFactor = 2;
    var timerStart = secondsToRun * tickFactor;
    var timerTotal = timerStart;
    var radialStart = 360;

    var wind = new UI.Window({
        backgroundColor: MAIN_BACKGROUND_COLOR
    });

    wind.status({
        color:           'white',
        backgroundColor: MAIN_BACKGROUND_COLOR,
        separator:       "none"
    });

    wind.action({
        select:          PLAY_IMAGE,
        backgroundColor: "clear"
    });

    var windSize = Feature.resolution();

    var width = 144 - 30;
    var radial = getRadial(width, radialStart);

    var countdownText = getCountdownText(width, secondsToRun);


    // Center the radial in the window

    function center(element) {
        element.position(element.position()
            .addSelf(windSize)
            .subSelf(element.size())
            .multiplyScalar(0.5));
    }


    wind.add(getBackgroundRadial(width))
        .add(radial)
        .add(countdownText)
        .show();


    wind.on('click', 'select', startStop);
    wind.on('click', 'up', reset);

    function stop() {
        clearInterval(timer.interval);
        if (timer.status === STARTED) {
            timer.status = PAUSED;
        }
        else {
            timer.status = STOPPED;
        }
    }

    function start() {
        function tick() {
            if (timerStart <= 0) {
                stop();
                vibe.vibrate("short");
            }
            else {
                --timerStart;
                countdownText.text(Math.ceil(timerStart / tickFactor));

                var percent = timerStart / timerTotal * 100;

                radial.angle2(radialStart * percent / 100);
            }

        }

        timer.status = STARTED;
        timer.interval = setInterval(tick, 1000 / tickFactor);
        tick();
    }

    function reset() {
        if (timer.status === PAUSED) {
            timerStart = secondsToRun * tickFactor;
            timerTotal = timerStart;
            radial.angle2(radialStart);
            countdownText.text(secondsToRun);
            wind.action({
                up:     "",
                select: PLAY_IMAGE
            });
        }
        else {
            console.log("reset()", "Invalid timer status", timer.status);
        }

    }

    function startStop() {

        switch (timer.status) {
            case STOPPED:
            case PAUSED:
                start();
                wind.action({
                    select: PAUSE_IMAGE
                });
                break;
            case STARTED:
                stop();
                wind.action({
                    up:     RESET_IMAGE,
                    select: PLAY_IMAGE
                });
                break;
            default:
                console.log("Wrong timer status ", timer.status);
        }
    }
}