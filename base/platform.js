const SunAzimuthAccessory = require('./accessory');

class SunAzimuthPlatform {
  constructor(log, config, api) {
    this.config = config;
    this.log = log;
    this.api = api;
    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;
    this.uuid = api.hap.uuid;
    this.PlatformAccessory = api.platformAccessory;
    this.accessories = [];
    this.cachedWeatherObj = undefined;
    this.checkingWeather = false;

    // Initialize accessories
    this.sensors = {};
    config.sensors.forEach((sensorConfig) => {
      this.sensors[sensorConfig.name] = new SunAzimuthAccessory(this, log, sensorConfig, config);
    });

    // Register new accessories after homebridge loaded
    api.on('didFinishLaunching', this.registerAccessories.bind(this));
  }

  registerAccessories() {
    const {
      log, config, api, uuid,
    } = this;

    // set up the weather updater
    if (config.apikey) {
      this.getWeather();
      const intervalSeconds = config.weatherUpdateIntervalSeconds > 0
        ? config.weatherUpdateIntervalSeconds : 60;
      setInterval(() => { this.getWeather(); }, intervalSeconds * 1000);
    }

    // Unregister removed accessories first
    let tempAccessories = [];
    this.accessories.forEach((accessory) => {
      const configExists = config.sensors.find(
        (sensor) => uuid.generate(sensor.name) === accessory.UUID,
      );

      if (!configExists) {
        log('Removing existing platform accessory from cache:', accessory.displayName);
        try {
          api.unregisterPlatformAccessories('homebridge-sun-azimuth', 'Sun Azimuth', [accessory]);
        } catch (e) {
          log('Could not unregister platform accessory!', e);
        }
      } else {
        tempAccessories.push(accessory);
      }
    });
    this.accessories = tempAccessories;

    tempAccessories = [];
    // Update cached accessories
    if (this.accessories.length > 0) {
      this.accessories.forEach((accessory) => {
        log('Updating cached accesory:', accessory.displayName);
        const sensorConfig = config.sensors.find(
          (sensor) => sensor.name === accessory.displayName,
        );
        if (
          sensorConfig.lowerThreshold === undefined
          || sensorConfig.upperThreshold === undefined
          || typeof sensorConfig.lowerThreshold !== 'number'
          || typeof sensorConfig.upperThreshold !== 'number'
          || sensorConfig.lowerThreshold > 720
          || sensorConfig.lowerThreshold < -360
          || sensorConfig.upperThreshold > 720
          || sensorConfig.upperThreshold < -360) {
          log(`Error: Thresholds of sensor ${sensorConfig.name} are not correctly configured. Please refer to the README. Unregistering this cached accessory.`);
          try {
            api.unregisterPlatformAccessories('homebridge-sun-azimuth', 'Sun Azimuth', [accessory]);
          } catch (e) {
            log('Could not unregister platform accessory!', e);
          }
        } else {
          const sensor = this.sensors[sensorConfig.name];
          sensor.setAccessory(accessory);
          tempAccessories.push(accessory);
        }

        // this.accessories[index] = this.sensors[accessory.displayName].initializeAccessory();
      });
      api.updatePlatformAccessories(this.accessories);
    }
    const configuredAccessories = tempAccessories;
    this.accessories = [];

    // Initialize new accessoroies
    config.sensors.forEach((sensorConfig) => {
      const configured = configuredAccessories.find(
        (accessory) => accessory.UUID === uuid.generate(sensorConfig.name),
      );
      if (configured) return;

      log('Registering accessory:', sensorConfig.name);

      if (
        sensorConfig.lowerThreshold === undefined
        || sensorConfig.upperThreshold === undefined
        || typeof sensorConfig.lowerThreshold !== 'number'
        || typeof sensorConfig.upperThreshold !== 'number'
        || sensorConfig.lowerThreshold > 720
        || sensorConfig.lowerThreshold < -360
        || sensorConfig.upperThreshold > 720
        || sensorConfig.upperThreshold < -360) {
        log(`Error: Thresholds of sensor ${sensorConfig.name} are not correctly configured. Please refer to the README.`);
        return;
      }

      const sensor = this.sensors[sensorConfig.name];
      if (!sensor.hasRegistered()) {
        this.accessories.push(sensor.initializeAccessory());
      }
    });

    // Collect all accessories after initialization to register them with homebridge
    if (this.accessories.length > 0) {
      api.registerPlatformAccessories('homebridge-sun-azimuth', 'Sun Azimuth', this.accessories);
    }
  }

  configureAccessory(accessory) {
    this.accessories.push(accessory);
  }

  getWeatherTemperaturCelsius() {
    let value;
    if (this.cachedWeatherObj && this.cachedWeatherObj.main) {
      value = parseFloat(this.cachedWeatherObj.main.temp);
    }
    return value;
  }

  getWeatherOvercast() {
    let value;
    if (this.cachedWeatherObj && this.cachedWeatherObj.clouds) {
      value = parseFloat(this.cachedWeatherObj.clouds.all);
    }
    return value;
  }

  getWeather() {
    const { log, config } = this;

    if (this.checkingWeather) return;

    this.checkingWeather = true;

    const url = `http://api.openweathermap.org/data/2.5/weather?appid=${config.apikey}&units=metric&lat=${config.lat}&lon=${config.long}`;
    if (config.debugLog) log('Checking weather: %s', url);

    fetch(url)
      .then(async (response) => {
        const responseBody = await response.text();
        if (config.debugLog) log('Server response:', responseBody);

        this.cachedWeatherObj = JSON.parse(responseBody);

        log(`Temperature: ${this.getWeatherTemperaturCelsius()}°C, overcast (cloud state): ${this.getWeatherOvercast()}%`);
      })
      .catch((error) => {
        log('HTTP get weather function failed: %s', error.message);
      })
      .finally(() => {
        this.checkingWeather = false;
      });
  }
}

module.exports = SunAzimuthPlatform;
