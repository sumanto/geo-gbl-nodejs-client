let inquirer = require('inquirer');


async function main() {
    let prompt = inquirer.createPromptModule();

    let userInfo = await prompt([ {
        type: 'input',
        name: 'name',
        message: 'What is your name'
    }, {
        type: 'input',
        name: 'name',
        message: 'What is your user name'
    }]);
    console.log(userInfo);

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
