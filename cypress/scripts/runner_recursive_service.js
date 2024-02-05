#!/usr/bin/env node
const dotenv = require("dotenv");
const {
    ParallelSpecsClient,
    filesToSpecInput,
} = require("@shelex/parallel-specs-client");
const cypress = require("cypress");

dotenv.config();

// get number of executors, command and arguments
const { executors = 1, filter } = process.argv.slice(2).reduce((acc, pair) => {
    const [key, value] = pair.split("=");
    acc[key] = value;
    return acc;
}, {});

// pass credentials and project
const client = new ParallelSpecsClient({
    project: process.env.PARALLEL_SPECS_PROJECT_NAME,
    token: process.env.PARALLEL_SPECS_API_KEY,
});

// get all specs
const specs = filesToSpecInput(
    ["**/e2e/**/*.cy.js"],
    filter ? filter.split(",").map((f) => f.trim()) : []
);

// create new session
const createdSession = client.addSession(specs);

console.log(`created session ${createdSession.sessionId}`);

let exitCode = 0;
const previousStatusesByMachineId = {};

/* execute cypress run for spec file */
const cypressTask = (spec) =>
    new Promise((resolve) =>
        cypress
            .run({
                browser: "chrome",
                spec: spec,
                config: {
                    video: false,
                },
            })
            .then((results) => {
                process.exitCode += results.totalFailed || 0;
                resolve(results.totalFailed || 0);
            })
            .catch((err) => {
                process.stdout.write(err);
                process.exitCode += 1;
                resolve(1);
            })
    );

const handleExitCode = (machineId, exitCode) => {
    previousStatusesByMachineId[machineId] =
        exitCode === 0 ? "passed" : "failed";
};

const getPreviousStatus = (machineId) => {
    const status = previousStatusesByMachineId[machineId] || "unknown";
    delete previousStatusesByMachineId[machineId];
    return status;
};

async function next(machineId) {
    const nextSpec = client.next({
        machineId,
        previousStatus: getPreviousStatus(machineId),
    });

    if (!nextSpec) {
        return Promise.reject(`ALL SPECS PROCESSED for ${machineId}\n`);
    }

    process.stdout.write(
        `PICKING UP NEXT TASK (${nextSpec}) for machine ${machineId}\n`
    );

    const exitCode = await cypressTask(nextSpec);
    handleExitCode(machineId, exitCode);
    return Promise.resolve(exitCode);
}

const executor = (machineId) =>
    Promise.resolve(
        (function recursive() {
            next(machineId)
                .then(recursive)
                .catch((e) => console.log(e));
        })()
    );

const runners = Array.from({ length: executors }, (_, v) =>
    executor(`machine${v + 1}`)
);

Promise.all(runners);

process.on("exit", () => {
    process.exit(exitCode);
});
