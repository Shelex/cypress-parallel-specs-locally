# cypress-parallel-specs-locally

[![SWUbanner](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://vshymanskyy.github.io/StandWithUkraine/)

Example scripts to play with Cypress locally and running in several processes.

# Arguments

Each script supports arguments:

-   `executors` - number of chainers which are picking specs to run;
-   `filter` - filtering specs path by keyword;

# Scripts

## runner_recursive

Is a pool of promises using recursion - [runner_recursive.js](cypress/scripts/runner_recursive.js)

### Commands

-   `yarn cy:run:recursive` - single executor
-   `yarn cy:run:recursive:parallel:empty` - with filtering
-   `yarn cy:run:recursive:parallel` - all specs

## runner_queue

Is an event based runner with queue - [runner_queue.js](cypress/scripts/runner_queue.js). Node v12+ is required.

`runner_queue` tries to solve an issue with several Cypress xvfb instances spawned at same time and fighting for same resource causing skipping some suites. Now a parameter `timeout` could be configured, which blocks new instance from spawning cypress if timeout from previous start has not finished. Value of `timeout` should be some +/- average time between starting cypress and opened browser, and it depends on your test suite size and available machine resources.

### Commands

-   `yarn cy:run:queue` - single executor
-   `yarn cy:run:queue:parallel:empty` - with filtering
-   `yarn cy:run:queue:parallel` - all specs

## runner_recursive_service

Is basically a `runner_recursive` but handles spec files with external [parallel-specs](https://github.com/Shelex/parallel-specs) service to distribute spec files across processes - [runner_recursive_service.js](cypress/scripts/runner_recursive_service.js)

Uses [parallel-specs-client](https://github.com/Shelex/parallel-specs-client) library to interact with parallel-specs service api.

`runner_recursive_service` is meant to solve an issue of distributing spec files by their expected duration in order to optimize total execution time

### Pre-requisites

-   obtain account at [parallel-specs](https://parallel-specs.shelex.dev/)
-   obtain api key at [api keys](https://parallel-specs.shelex.dev/apiKeys) page
-   set `.env` file variables `PARALLEL_SPECS_PROJECT_NAME` and `PARALLEL_SPECS_API_KEY`, example - [example.env](example.env)

### Commands

-   `yarn cy:run:recursive:service` - single executor
-   `yarn cy:run:recursive:service:parallel:empty` - with filtering
-   `yarn cy:run:recursive:service:parallel` - all specs

How to run any command with mochawesome report:

-   `yarn prereport`
-   `yarn cy:run:recursive:parallel:empty`
-   `yarn postreport`
