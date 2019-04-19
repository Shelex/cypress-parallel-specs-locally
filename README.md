# cypress-parallel-specs
Script for parallel Cypress specs execution locally - [parallel.js](cypress/scripts/parallel.js)

Arguments:  
`executors` = number of chainers which are picking specs to run;  
`script` = npm script to fire cypress(configs, envs, etc. could be passed here);  
`filter` = filtering specs path by keyword;  

How to run:  
```yarn cy:run:parallel:empty```

How to run with mochawesome report:
1. ```yarn prereport```
2. ```yarn cy:run:parallel:empty```
3. ```yarn postreport```
