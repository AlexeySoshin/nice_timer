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

var timers = [
    {
        running: false,
        seconds: 10,
        interval: null
    },
    {
        running: false,
        seconds: 30,
        interval: null
    },
    {
        running: false,
        seconds: 60,
        interval: null
    }];

showMenu();

function showMenu() {

    var menu = new UI.Menu({
        sections: [{
            items: [{
                title: '10 seconds',
                subtitle: '00:10'
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
        console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
        console.log('The item is titled "' + e.item.title + '"');

        if (selected) {
            selected.item.icon = '';
        }
        e.item.icon = 'images/menu_icon.png';
        selected = e;
        showTimer(timers[e.itemIndex]);
    });
    menu.show();
}

function showTimer(timer) {

    var secondsToRun = timer.seconds;

    var tickFactor = 2;
    var timerStart = secondsToRun * tickFactor;
    var timerTotal = timerStart;
    var radialStart = 360;

    var wind = new UI.Window({
        backgroundColor: 'black'
    });
    wind.status({
        color: 'white',
        backgroundColor: 'black',
        separator: "none"
    });


    var width = 140;
    var radial = new UI.Radial({
        size: new Vector2(width, width),
        angle: 0,
        angle2: radialStart,
        radius: radialRadius,
        backgroundColor: radialColor,
        borderColor: 'black',
        borderWidth: 0
    });

    var radial2 = new UI.Radial({
        size: new Vector2(width, width),
        angle: 0,
        angle2: radialStart,
        radius: radialRadius / 2,
        backgroundColor: '#AAAAAA',
        borderColor: 'black',
        borderWidth: 0
    });

    var countdownText = new UI.Text({
        size: new Vector2(width, 60),
        font: 'bitham-42-bold',
        text: secondsToRun,
        textAlign: 'center'
    });
    var doneText = new UI.Text({
        size: new Vector2(width, 60),
        font: 'bitham-42-bold',
        text: secondsToRun,
        textAlign: 'center'
    });

    var selectText = new UI.Text(
        {
            size: new Vector2(width, 40),
            font: 'gothic-24-bold',
            text: "Start",
            textAlign: 'right'
        }
    );

    var upText = new UI.Text(
        {
            size: new Vector2(width, 40),
            font: 'gothic-24-bold',
            text: "Reset",
            textAlign: 'right'
        }
    );
    var windSize = Feature.resolution();

    // Center the radial in the window


    function center(element) {
        element.position(element.position()
            .addSelf(windSize)
            .subSelf(element.size())
            .multiplyScalar(0.5));
    }

    center(countdownText);
    center(selectText);


    wind.add(radial2)
        .add(radial)
        .add(selectText)
        .add(countdownText)
        .add(upText)
        .show();


    wind.on('click', 'select', startStop);

    function stop() {
        if (timerStart > 0) {
            selectText.text("Cont.");
        }
        else {
            selectText.text("Reset");
        }

      //  clearInterval(timer.interval);
        timer.running = false;
    }

    function start() {
        function tick() {
            if (timerStart <= 0) {
                wind.remove(countdownText).add(doneText);
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

        timer.running = true;
        selectText.text("Stop");
        timer.interval = setInterval(tick, 1000 / tickFactor);
        tick();
    }

    function reset() {
        timerStart = secondsToRun * tickFactor;
        timerTotal = timerStart;
        radial.angle2(radialStart);
        countdownText.text(secondsToRun);
        selectText.text("Start");
        wind.remove(doneText).add(countdownText);
    }

    function startStop() {
        if (!timer.running) {
            if (timerStart <= 0) {
                reset();
            }
            else {
                start();
            }
        }
        else {
            stop();
        }
    }
}