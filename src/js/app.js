/**
 * Nice Timer for Pebble Smartwatch
 *
 * @author Alexey Soshin
 */

// Import the Clay package
var Clay = require('clay');
// Load our Clay configuration file
var clayConfig = require('./config');
// Initialize Clay
var clay = new Clay(clayConfig);




var UI = require('ui');
var Vector2 = require('vector2');
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

var SHORT_VIBRATION = "short";

var BUTTONS = {
  SELECT: 'select',
  BACK:   'back',
  UP:     'up'
};

var EMPTY = "";

var autostart = true;

var MINUTE = 60;

var TIME = {
  MINUTES:   " minutes",
  SECONDS:   " seconds",
  SECOND:    " second",
  MINUTE:    " minute",
  ZERO:      "0",
  SEPARATOR: ":"
};

var timers = [
  {
    status:   STOPPED,
    seconds:  15,
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

// Convert minutes and seconds to "x minutes y seconds"
function timeToWords(m, s) {

  var result = [];

  if (m > 0) {
    result.push(m);

    if (s == 1) {
      result.push(TIME.SECOND);
    }
    else {
      result.push(TIME.SECONDS);
    }
  }

  if (s > 0) {
    result.push(s);

    if (s == 1) {
      result.push(TIME.MINUTE);
    }
    else {
      result.push(TIME.MINUTES);
    }
  }

  return result.join(EMPTY);
}

function getTimersMenuItems() {

  // Convert minutes and seconds to "minute:second" with leading zeroes
  function timeToString(m, s) {

    function padTime(x) {
      return x < 10 ? [TIME.ZERO, x].join(EMPTY) : x
    }

    return [padTime(m), padTime(s)].join(TIME.SEPARATOR);
  }

  var result = [];
  for (var i = 0; i < timers.length; i++) {
    var timer = timers[i];

    var seconds = timer.seconds % MINUTE;
    var minutes = timer.seconds / MINUTE;

    result.push({
      title:    timeToWords(minutes, seconds),
      subtitle: timeToString(minutes, seconds)
    })
  }
}

function showMenu() {


  var menu = new UI.Menu({

    sections: [{
      items: getTimersMenuItems()
    }]
  });
  var selected = null;
  menu.on(BUTTONS.SELECT, function (e) {
    if (selected) {
      selected.item.icon = EMPTY;
    }
    //    e.item.icon = 'images/menu_icon.png';
    selected = e;
    showTimer(timers[e.itemIndex]);
  });
  menu.show();
}

function getBackgroundRadial(width) {
  var radial = new UI.Radial({
    size:            new Vector2(width, width),
    angle:           0,
    angle2:          360,
    radius:          radialRadius / 2,
    backgroundColor: '#AAAAAA',
    borderColor:     MAIN_BACKGROUND_COLOR,
    borderWidth:     0
  });

  padTop(radial, 25);

  return radial;
}

function getCountdownText(width, secondsToRun) {
  var text = new UI.Text({
    size:      new Vector2(width, 60),
    font:      'bitham-42-bold',
    text:      secondsToRun,
    textAlign: 'center'
  });


  padTop(text, 80);

  return text;
}

function getRadial(width, radialStart) {
  var radial = new UI.Radial({
    size:            new Vector2(width, width),
    angle:           0,
    angle2:          radialStart,
    radius:          radialRadius,
    backgroundColor: radialColor,
    borderColor:     MAIN_BACKGROUND_COLOR,
    borderWidth:     0
  });

  padTop(radial, 25);

  return radial;

}

function padTop(element, padding) {
  element.position(element.position()
      .addSelf(new Vector2(0, padding))
      .multiplyScalar(0.5));
}

/**
 *
 * @param times - number of times to vibrate
 */
function vibrate(times) {

  for (var i = 0; i < times; i++) {
    setTimeout(function () {
      vibe.vibrate(SHORT_VIBRATION);
    }, i * 1000);
  }
}

function getTimerWindow() {
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
    backgroundColor: MAIN_BACKGROUND_COLOR
  });

  return wind;
}

function getAvailableWidth() {
  var MENU_WIDTH = 30;
  return 144 - MENU_WIDTH;
}

function showTimer(timer) {

  var secondsToRun = timer.seconds;

  var tickFactor = 2;
  var timerStart = secondsToRun * tickFactor;
  var timerTotal = timerStart;
  var radialStart = 360;

  var wind = getTimerWindow();

  var width = getAvailableWidth();
  var radial = getRadial(width, radialStart);

  var countdownText = getCountdownText(width, secondsToRun);


  wind.add(getBackgroundRadial(width))
      .add(radial)
      .add(countdownText)
      .show();


  wind.on('click', BUTTONS.SELECT, startStop);
  wind.on('click', BUTTONS.UP, reset);
  wind.on('click', BUTTONS.BACK, backToMenu);

  if (autostart) {
    start();
  }

  function backToMenu() {
    clearInterval(timer.interval);

    timer.status = STOPPED;

    // First time the window hides
    wind.hide();

    // Second time destroyed
    wind.hide();
  }

  function stop() {
    clearInterval(timer.interval);
    if (timer.status === STARTED && timerStart > 0) {
      pausedState();
    }
    else {
      reset();
    }
  }

  function pausedState() {
    timer.status = PAUSED;
    wind.action({
      up:     RESET_IMAGE,
      select: PLAY_IMAGE
    });
  }

  function stoppedState() {
    timer.status = STOPPED;
    wind.action({
      up:     EMPTY,
      select: PLAY_IMAGE
    });
  }

  function startedState() {
    timer.status = STARTED;
    wind.action({
      up:     EMPTY,
      select: PAUSE_IMAGE
    });
  }

  function start() {
    function tick() {
      if (timerStart <= 0) {
        stop();
        reset();
        vibrate(3);
      }
      else {
        --timerStart;
        countdownText.text(Math.ceil(timerStart / tickFactor));

        var percent = timerStart / timerTotal * 100;

        radial.angle2(radialStart * percent / 100);
      }

    }

    startedState();


    timer.interval = setInterval(tick, 1000 / tickFactor);
    tick();
  }

  function reset() {
    if (timer.status === PAUSED || timer.status === STOPPED) {
      timerStart = secondsToRun * tickFactor;
      timerTotal = timerStart;
      radial.angle2(radialStart);
      countdownText.text(secondsToRun);
      stoppedState();
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

        break;
      case STARTED:
        stop();

        break;
      default:
        console.log("Wrong timer status ", timer.status);
    }
  }
}