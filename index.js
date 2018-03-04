let inquirer = require('inquirer');


async function main() {
    let prompt = inquirer.createPromptModule();
    let answer = await prompt([ {
        type: 'list',
        name: 'ans1',
        message: 'Example question',
        choices: [ {
            name: 'Choice A',
            value: 'ch1'
        }, {
            name: 'choice B',
            value: 'ch2'
        } ]
    }]);
    console.log(answer);
}

main();
