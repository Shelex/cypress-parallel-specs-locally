# cypress-parallel-specs-locally
Script for parallel Cypress specs execution locally - [parallel.js](cypress/scripts/parallel.js)

Arguments:  
`executors` = number of chainers which are picking specs to run;  
`filter` = filtering specs path by keyword;  

How to run:  
 - ```yarn cy:run``` - single executor
 - ```yarn cy:run:parallel:empty``` - with filtering
 - ```yarn cy:run:parallel``` - all specs

How to run with mochawesome report:
 -  ```yarn prereport```
 - ```yarn cy:run:parallel:empty```
 - ```yarn postreport```
