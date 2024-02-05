const { defineConfig } = require('cypress')

module.exports = defineConfig({
  chromeWebSecurity: false,
  reporterOptions: {
    reporterEnabled: 'mochawesome',
    reportDir: 'cypress/results',
    overwrite: false,
    html: false,
    json: true,
  },
  restartBrowserBetweenSpecFiles: true,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
  },
})
