# Nice Timer for Pebble Smartwatch
As the name states, this is a nice timer written for Pebble Smartwatch.<br />
Developed using PebbleJS <br />
Most of the code is based on original <a href = 'https://github.com/pebble/pebblejs'>PebbleJS</a> example <br />
If you're interested in the actual code, start with **app.js**

The application is integrated with ClayJS to support easy configuration management
Configuration is within **config.js** file
Since PebbleJS doesn't support NPM packages yet, I have to use legacy ClayJS 0.1.7


## Pebble SDK
On OSX
```
brew update && brew install pebble/pebble-sdk/pebble-sdk
```


## Installation
After you installed PebbleJS SDK do:

```
pebble build && pebble install --phone <IP>
```

To display logs


```
pebble build && pebble install --phone <IP> && pebble logs --phone <IP>
```

## Screenshots and downloads
https://apps.rebble.io/en_US/application/5814927a204470de17000154?query=nice%2520timer&section=watchapps

## License 
MIT
