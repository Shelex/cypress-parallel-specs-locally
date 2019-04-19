// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

//const cucumber = require('cypress-cucumber-preprocessor').default;
module.exports = (on, config) => {
    on('before:browser:launch', (browser = {}, args) => {
        if (browser.name === 'chrome') {
            args.push(
                '--disable-site-isolation-trials',
                '--start-maximized',
                '--disable-notifications',
                '--disable-background-mode'
            );
            return args;
        }
    });
    on('window:load', win => {
        win.open = (url, target, features) => {
            Cypress.log({
                name: 'BLOCK_TAB',
                message: `url=${url}`,
                consoleProps: () => {
                    return {
                        url: url,
                        target: target,
                        features: features
                    };
                }
            });
        };
    });
  }