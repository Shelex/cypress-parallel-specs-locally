// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'


// Alternatively you can use CommonJS syntax:
// require('./commands')

before(() => {
    if (Cypress.env('setupSuite')) {
        cy.log(`THIS IS GLOBAL BEFORE HOOK EXECUTED ONCE`)
    }
})

after(() => {
    if (Cypress.env('teardownSuite')) {
        cy.log(`THIS IS GLOBAL BEFORE HOOK EXECUTED ONCE`)
    }
})

Cypress.on('window:before:load', win => {
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