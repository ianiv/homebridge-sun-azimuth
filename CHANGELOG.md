## Change Log

### v0.4.0 (2026/07/02)
- chore: Update for Homebridge 2.0 compatibility (`engines.homebridge` now `^1.8.0 || ^2.0.0`, `engines.node` now `^20.18.0 || ^22.10.0 || ^24.0.0`)
- chore: Stop relying on `global.Service`/`global.Characteristic`/`global.UUIDGen`/`global.Accessory`; use the `api` instance passed to the platform instead
- chore: Replace deprecated `request` dependency with the native `fetch` API
- chore: Replace deprecated `.on('get', ...)` characteristic handler with `.onGet(...)`

### v0.3.7 (2024/07/19 18:24)
- feature: Add a minimum temperature per zone that has to be reached before it can be considered to be sunny

### v0.3.0 (2024/07/18 21:24)
- feature: Make "Highest acceptable overcast" configurable
- feature: Make "Lower/Upper Altitude Thresholds" configurable per sensor
- feature: Make the weather update interval configurable

### v0.2.3 (2021/05/13 23:45)
- fix: device serial number must have at least 3 digits
- fix: avoid divergent sensor cloud state by checking cloud state at uneven times

### v0.2.2 (2021/04/13 01:00)
- feature: device model and manufacturer

### v0.2.1 (2021/04/12 23:45)
- fix: error handling
- fix: UI settings description text
- chore: GitHub description
- chore: Readme description text

### v0.2.0 (2021/04/12 14:00)
 Initial fully working version, based on fork from [homebridge-sunsensors](https://github.com/mfkrause/homebridge-sunsensors)
