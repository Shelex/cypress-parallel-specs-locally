#!/usr/bin/env node
const glob = require('glob');
const { exec } = require('child_process');
let args = process.argv.slice(2);

/* Parse args */
const { executors, script, filter } = args.reduce((acc, pair) => {
    let [key, value] = pair.split('=');
    acc[key] = value;
    return acc;
}, {});

/* get list of all .spec files based on npm script */
let specs = glob
    .sync('cypress/integration/**/*.spec.js')
    .filter(specPath =>
        typeof filter === 'undefined'
            ? specPath
            : specPath.includes(filter)
    );

process.stdout.write(
    `Running cypress in parallel with ${executors} executors\n`
);
process.stdout.write(`Found ${specs.length} spec files\n`);

/* execute cypress run for spec file */
const cypressTask = spec => {
    process.stdout.write(
        `RUNNING ${spec}\n`
    );
    return new Promise((resolve) => {
        exec(`yarn ${script} -s ${spec}`, (err, stdout, stderr) => {
            process.stdout.write(stdout);
            process.stdout.write(stderr);
        }).on('exit', () => {
            resolve();
        });
    });
};

/* pick feature from array and run cypress task */
function next() {
    if (specs.length > 0) {
        process.stdout.write(
            `PICKING UP NEXT SPEC FROM REMAINING ${specs.length}\n`
        );
        return cypressTask(specs.shift());
    } else {
        return Promise.reject('NO SPECS LEFT\n')
    }
}

/* chain recursively cypress run task and picking another feature from array */
const chainer = () => {
    return new Promise((resolve) => {
        resolve(
            (function recursive() {
                    next().then(recursive).catch(e => process.stdout.write(e))  
            })()
        );
    });
};

/* create array of executors */
let chains = Array.from({ length: executors }, chainer);

/* run executors */
Promise.all(chains);
