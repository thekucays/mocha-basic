import { BeforeAll, AfterAll } from '@cucumber/cucumber';

BeforeAll(async function () {
    console.log('Starting BDD test suite...');
});

AfterAll(async function () {
    console.log('BDD test suite completed.');
});
