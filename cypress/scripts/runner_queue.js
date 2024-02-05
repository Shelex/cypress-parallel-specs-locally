#!/usr/bin/env node
const cypress = require("cypress");
const glob = require("glob");
const Queue = require("@shelex/promise-queue-timeout");

/* Parse args */
let { executors = 1, filter } = process.argv.slice(2).reduce((acc, pair) => {
    let [key, value] = pair.split("=");
    acc[key] = value;
    return acc;
}, {});

process.exitCode = 0;

/* get list of all .spec files*/
let specs = glob
    .sync("cypress/e2e/**/*.cy.js")
    .filter((specPath) => (filter ? specPath.includes(filter) : specPath));

const initialSpecsCount = specs.length;
console.log(`Running cypress with ${executors} executors\n`);
console.log(`Found ${initialSpecsCount} spec files\n`);

const runner = new Queue({
    executors: executors,
    timeout: 10000,
});

specs.forEach((spec, index) => {
    const globalHooks = {};
    // global before hook:
    index === 0 && (globalHooks.setupSuite = true);
    // global after hook:
    index === specs.length - 1 && (globalHooks.teardownSuite = true);

    runner.enqueue(() => {
        return cypress.run({
            browser: "chrome",
            spec: spec,
            config: {
                video: false,
            },
            env: {
                ...globalHooks,
            },
        });
    }, spec);
});

runner.on("resolve", (results) => {
    process.exitCode += results.totalFailed || 0;
});

runner.on("reject", (err) => {
    process.stdout.write(err);
    process.exitCode += 1;
});

runner.on("starting_task", (spec, specsCount) => {
    console.log(
        `starting ${spec}, ${
            initialSpecsCount - specsCount + 1
        }/${initialSpecsCount}`
    );
});

process.on("exit", (code) => {
    return console.log(`Runner process exit with code ${code}`);
});
