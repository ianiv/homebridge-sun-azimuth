const suncalc = require('suncalc');

class SunAzimuthAccessory {
  constructor(platform, log, config, platformConfig) {
    this.platform = platform;
    this.accessory = null;
    this.registered = null;
    this.config = config;
    this.platformConfig = platformConfig;
    this.log = log;
  }

  getAccessory() {
    return this.accessory;
  }

  setAccessory(accessory) {
    this.accessory = accessory;
    this.setAccessoryEventHandlers();
  }

  hasRegistered() {
    return this.registered;
  }

  initializeAccessory() {
    const { config, platform } = this;
    const {
      Service, Characteristic, uuid: uuidGen, PlatformAccessory,
    } = platform;
    const { lowerThreshold, upperThreshold } = config;
    const uuid = uuidGen.generate(config.name);
    const accessory = new PlatformAccessory(config.name, uuid);
    // Add Device Information
    accessory.getService(Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, 'mfkrause, Krillle & awaescher')
      .setCharacteristic(Characteristic.Model, 'Azimuth ' + lowerThreshold + '-' + upperThreshold)
      .setCharacteristic(Characteristic.SerialNumber, '---');

    const SensorService = accessory.addService(Service.ContactSensor, config.name);

    if (SensorService) {
      SensorService.getCharacteristic(Characteristic.ContactSensorState);
    }

    this.setAccessory(accessory);

    return accessory;
  }

  setRegistered(status) {
    this.registered = status;
  }

  setAccessoryEventHandlers() {
    const { log, platform } = this;
    const { Service, Characteristic } = platform;

    this.getAccessory().on('identify', (paired, callback) => {
      log(this.getAccessory().displayName, `Identify sensor, paired: ${paired}`);
      callback();
    });

    const SensorService = this.getAccessory().getService(Service.ContactSensor);

    if (SensorService) {
      SensorService
        .getCharacteristic(Characteristic.ContactSensorState)
        .onGet(this.getState.bind(this));

      SensorService.setCharacteristic(Characteristic.ContactSensorState, this.updateState());
      setInterval(() => {
        SensorService.setCharacteristic(Characteristic.ContactSensorState, this.updateState());
      }, 10007);
    }
  }

  updateState() {
    const { config, platformConfig, log } = this;
    const { lat, long, apikey, enableWeatherIntegration, highestAcceptableOvercast = 25 } = platformConfig;
    const { name, lowerThreshold = 0, upperThreshold = 0, minimumTemperatureCelsuisConsideredSunny = 20, lowerAltitudeThreshold = 0, upperAltitudeThreshold = 90 } = config;
    const azimuthThresholds = [lowerThreshold, upperThreshold];

    if (!lat || !long || typeof lat !== 'number' || typeof long !== 'number') {
      log(`${name}: Error: Lat/Long incorrect. Please refer to the README.`);
      return 0;
    }

    const sunPos = suncalc.getPosition(Date.now(), lat, long);
    let sunPosDegrees = sunPos.azimuth;
    let sunPosAltitude = sunPos.altitude;

    if (platformConfig.debugLog)
      log(`${name}: Current azimuth: ${sunPosDegrees}°, altitude: ${sunPosAltitude}°`);

    if (azimuthThresholds[0] > azimuthThresholds[1]) {
      const tempThreshold = azimuthThresholds[1];
      azimuthThresholds[1] = azimuthThresholds[0];
      azimuthThresholds[0] = tempThreshold;
    }

    const isWithinThreshold = (position) => position >= azimuthThresholds[0] && position <= azimuthThresholds[1] && sunPosAltitude >= lowerAltitudeThreshold && sunPosAltitude <= upperAltitudeThreshold;

    let newState = isWithinThreshold(sunPosDegrees);

    if (azimuthThresholds[0] < 0 && !newState) {
      sunPosDegrees = -(360 - sunPosDegrees);
      newState = isWithinThreshold(sunPosDegrees);
    }

    if (azimuthThresholds[1] > 360 && !newState) {
      sunPosDegrees = 360 + sunPosDegrees;
      newState = isWithinThreshold(sunPosDegrees, azimuthThresholds);
    }

    // Sun is in relevant azimuth and altitude range, lets check daylight and clouds
    if (newState && apikey) {
      let overcast = this.platform.getWeatherOvercast();
      let temperatureDegreeCelsius = this.platform.getWeatherTemperaturCelsius();

      if (enableWeatherIntegration) {
        const isOvercastAcceptable = overcast <= highestAcceptableOvercast
        const isMinimumTemperatureReached = temperatureDegreeCelsius > minimumTemperatureCelsuisConsideredSunny;
        newState = isOvercastAcceptable && isMinimumTemperatureReached;
        if (platformConfig.debugLog)
          log(`${name}: Temperature: ${temperatureDegreeCelsius}°C, overcast: ${overcast}% clouds => New state is ${newState} (isOvercastAcceptable: ${isOvercastAcceptable}, isMinimumTemperatureReached ${isMinimumTemperatureReached})`);
      } else {
        if (platformConfig.debugLog)
          log(`${name}: Temperature: ${temperatureDegreeCelsius}°C, overcast: ${overcast}% clouds (weather integration is disabled)`);
      }
    }

    return newState ? 1 : 0;
  }

  getState() {
    const { platformConfig, log } = this;
    const newState = this.updateState();

    if (platformConfig.debugLog)
      log(this.getAccessory().displayName, `State: ${newState}`);

    return newState;
  }

}

module.exports = SunAzimuthAccessory;
