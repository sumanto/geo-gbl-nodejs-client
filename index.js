let inquirer = require('inquirer');


main();


// Main entry for the program
async function main() {
    let prompt = inquirer.createPromptModule();

    let userInfo = await prompt([ {
        type: 'input',
        name: 'name',
        message: 'What is your name',
        validate: validator
    }, {
        type: 'input',
        name: 'username',
        message: 'What is your user name',
        validate: validator
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


// Simple input validator
function validator(str) {
    return (str && str.length > 0);
}

