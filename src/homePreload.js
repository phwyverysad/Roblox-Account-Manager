const { webFrame } = require('electron');

try {
  webFrame.executeJavaScript(`
    (function() {
      try {
        delete Object.getPrototypeOf(navigator).webdriver;
      } catch (e) {}

      try {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
          configurable: true,
          enumerable: true
        });
      } catch (e) {}

      try {
        Object.defineProperty(navigator, 'vendor', {
          get: () => 'Google Inc.',
          configurable: true,
          enumerable: true
        });
      } catch (e) {}

      try {
        Object.defineProperty(navigator, 'deviceMemory', {
          get: () => 8,
          configurable: true,
          enumerable: true
        });
      } catch (e) {}

      try {
        Object.defineProperty(navigator, 'hardwareConcurrency', {
          get: () => 8,
          configurable: true,
          enumerable: true
        });
      } catch (e) {}

      try {
        const uaData = {
          brands: [
            { brand: 'Google Chrome', version: '136' },
            { brand: 'Chromium', version: '136' },
            { brand: 'Not?A_Brand', version: '24' }
          ],
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: async (hints) => ({
            architecture: 'x86',
            bitness: '64',
            brands: [
              { brand: 'Google Chrome', version: '136' },
              { brand: 'Chromium', version: '136' },
              { brand: 'Not?A_Brand', version: '24' }
            ],
            fullVersionList: [
              { brand: 'Google Chrome', version: '136.0.0.0' },
              { brand: 'Chromium', version: '136.0.0.0' },
              { brand: 'Not?A_Brand', version: '24.0.0.0' }
            ],
            mobile: false,
            model: '',
            platform: 'Windows',
            platformVersion: '10.0.0',
            uaFullVersion: '136.0.0.0'
          }),
          toJSON: () => ({
            brands: [
              { brand: 'Google Chrome', version: '136' },
              { brand: 'Chromium', version: '136' },
              { brand: 'Not?A_Brand', version: '24' }
            ],
            mobile: false,
            platform: 'Windows'
          })
        };
        Object.defineProperty(navigator, 'userAgentData', {
          get: () => uaData,
          configurable: true,
          enumerable: true
        });
      } catch (e) {}

      try {
        if (!window.chrome) {
          window.chrome = {
            app: {
              isInstalled: false,
              InstallState: { DISABLED: 'disabled', INSTALLED: 'installed', NOT_INSTALLED: 'not_installed' },
              RunningState: { CANNOT_RUN: 'cannot_run', READY_TO_RUN: 'ready_to_run', RUNNING: 'running' }
            },
            runtime: {
              OnInstalledReason: {},
              OnRestartRequiredReason: {},
              PlatformArch: {},
              PlatformNaclArch: {},
              PlatformOs: {},
              RequestUpdateCheckStatus: {}
            },
            loadTimes: function() {},
            csi: function() {}
          };
        }
      } catch (e) {}
    })();
  `);
} catch (e) {}
