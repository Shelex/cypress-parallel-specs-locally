#!/usr/bin/env node
const EventEmitter = require('events');
const cypress = require('cypress');
const glob = require('glob');

/* Parse args */
let { executors = 1, filter } = process.argv.slice(2).reduce((acc, pair) => {
    let [key, value] = pair.split('=');
    acc[key] = value;
    return acc;
}, {});

process.exitCode = 0;

/* get list of all .spec files*/
let specs = glob
    .sync('cypress/integration/**/*.spec.js')
    .filter(specPath =>
        typeof filter === 'undefined' ? specPath : specPath.includes(filter),
    );

const initialSpecsCount = specs.length;
console.log(`Running cypress with ${executors} executors\n`);
console.log(`Found ${initialSpecsCount} spec files\n`);

class Runner extends EventEmitter {
    tasks = new Map();
    previousStartTime;
    timeoutId;
    runningExecutors = 0;
    state = 'pending';
    options = {
        executors: 2,
        interval: 7000,
    };

    constructor(options = {}) {
        super();
        this.options = { ...this.options, ...options };
    }

    start() {
        if (this.state !== 'running' && !this.isEmpty) {
            this.state = 'running';
            this.emit('start');

            (async () => {
                while (this.shouldRun) {
                    await this.next();
                }
            })();
        }
    }

    stop() {
        clearTimeout(this.timeoutId);

        this.state = 'finished';
        this.emit('stop');
    }

    finish() {
        this.runningExecutors -= 1;

        if (this.runningExecutors === 0 && this.isEmpty) {
            this.stop();

            this.state = 'pending';

            this.emit('end');
        }
    }

    async execute() {
        const [spec] = this.tasks.keys();
        const promise = this.tasks.get(spec);

        if (this.runningExecutors < this.options.executors) {
            this.runningExecutors++;
            this.emit('starting_spec', spec, this.tasks.size)
            this.tasks.delete(spec);
        }

        // check if another executor available
        if (this.runningExecutors < this.options.executors) {
            this.next();
        }

        const output = await Promise.resolve(promise())
            .then(value => {
                this.emit('resolve', value);
                return value;
            })
            .catch(error => {
                this.emit('reject', error);
                return error;
            })
            .finally(() => {
                this.emit('next');
                this.finish();
            });

        return output;
    }

    next() {
        const { interval } = this.options;

        return new Promise((resolve, reject) => {
            if (!this.previousStartTime) {
                this.previousStartTime = Date.now() - interval;
            }

            if (this.timeoutId && !this.timeoutId._destroyed) {
                // existing timeout is active, try again next time :)
                return;
            }

            clearTimeout(this.timeoutId);

            const newTimeout = interval - (Date.now() - this.previousStartTime);

            if (newTimeout > 0) {
                console.log(
                    `found already starting cypress, will wait for ${newTimeout}ms`,
                );
            }

            return new Promise(
                resolve => (this.timeoutId = setTimeout(resolve, newTimeout)),
            ).then(() => {
                this.previousStartTime = Date.now();
                this.execute().then(resolve);
            });
        });
    }

    enqueue(spec, task) {
        this.tasks.set(spec, task);

        if (this.state !== 'finished') {
            this.start();
        }
    }

    get isEmpty() {
        return this.tasks.size === 0;
    }

    get shouldRun() {
        return !this.isEmpty && this.state !== 'finished';
    }
}

const runner = new Runner({
    executors: executors,
    interval: 7000,
});

specs.forEach((spec, index) => {
    const globalHooks = {};
    // global before hook:
    index === 0 && (globalHooks.setupSuite = true);
    // global after hook:
    index === specs.length - 1 && (globalHooks.teardownSuite = true);

    runner.enqueue(spec, () => {
        return cypress.run({
            browser: 'chrome',
            spec: spec,
            config: {
                video: false,
            },
            env: {
                ...globalHooks,
            },
        });
    });
});

runner.on('resolve', (results) => {
  process.exitCode += results.totalFailed || 0;
})

runner.on('reject', (err) => {
  process.stdout.write(err);
  process.exitCode += 1;
})

runner.on('starting_spec', (spec, specsCount) => {
  console.log(
    `starting ${spec}, ${initialSpecsCount -
      specsCount + 1}/${initialSpecsCount}`,
);
})

process.on('exit', code => {
    return console.log(`Runner process exit with code ${code}`);
});
