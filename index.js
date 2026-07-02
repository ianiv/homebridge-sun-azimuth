const SunAzimuthPlatform = require('./base/platform');

module.exports = (api) => {
  api.registerPlatform('homebridge-sun-azimuth', 'Sun Azimuth', SunAzimuthPlatform);
};
