# cypress-parallel-specs-locally

[![SWUbanner](https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner2-direct.svg)](https://vshymanskyy.github.io/StandWithUkraine/)

Script for parallel Cypress specs execution locally:

- runnner_v1 is a pool of promises with recursion - [runner.js](cypress/scripts/runner.js)
- runner_v2 is an event based runner with state - [runner_v2.js](cypress/scripts/runner_v2.js), for node 12+

Runner v2 tries to solve an issue with several Cypress xvfb instances spawned at same time and fighting for same resource causing skipping some suites. Now a parameter `timeout` could be configured, which blocks new instance from spawning cypress if timeout from previous start has not finished. Value of `timeout` should be some +/- average time between starting cypress and opened browser, and it depends on your test suite size and available machine resources.

Arguments:  
`executors` = number of chainers which are picking specs to run;  
`filter` = filtering specs path by keyword;

How to run runner v1:

- `yarn cy:run` - single executor
- `yarn cy:run:parallel:empty` - with filtering
- `yarn cy:run:parallel` - all specs

How to run runner v2:

- `yarn cy:run_v2` - single executor
- `yarn cy:run_v2:parallel:empty` - with filtering
- `yarn cy:run_v2:parallel` - all specs

How to run with mochawesome report:

- `yarn prereport`
- `yarn cy:run:parallel:empty`
- `yarn postreport`
