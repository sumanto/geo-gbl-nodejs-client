// process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'geo,geo:fine';

let inquirer = require('inquirer');
let fs = require('fs');
let path = require('path');
let d = require('debug')('geo');
let d_f = require('debug')('geo:fine');
let _ = require('lodash');


main();


// Main entry for the program
async function main() {
    e('main');

    let prompt = inquirer.createPromptModule();

    let contents = fs.readFileSync(path.join(__dirname, 'data', 'us_cities.json'), 'utf8');
    let data = JSON.parse(contents);

    let gameMetaDatacontents = fs.readFileSync(path.join(__dirname, 'data', 'game_metadata.json'), 'utf8');
    let metadata = JSON.parse(gameMetaDatacontents);

    console.log('Welcome to ' + data.title);
    addSeparator();

    console.log('Description: ' + data.description);
    addSeparator();

    let response;
    response = await prompt([ {
        type: 'list',
        name: 'ready',
        message: 'Ready to play?',
        choices: [ {
            name: 'Yes, of course',
            value: 'yes'
        }, {
            name: 'No, exit for now',
            value: 'no'
        } ],
        validate: validator
    }]);

    d(response);
    if (response.ready === 'no') {
        console.log('See you later, bye...');
        return;
    }

    addSeparator();
    console.log(data.main.welcome);
    addSeparator();

    console.log('Lets get some information about you');
    addNewLines(1);


    //--------------------------------------------
    // User information
    //
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

    d(userInfo);

    addSeparator();
    console.log('** Welcome ' + userInfo.name);
    addSeparator();


    //--------------------------------------------
    // TODO: Start with LA, but randomize later
    //
    let city = data.cities.la;
    console.log('You are in %s, also known as %s', city.name, getRandomData(city.nicknames));
    addSeparator();


    //--------------------------------------------
    // Randomly choose attributes for the thief
    //
    let thiefAttributes = {};
    for (let key of Object.keys(metadata.attributes)) {
       let values =  Object.keys(metadata.attributes[key]);
       thiefAttributes[key] = getRandomData(values);
    }

    addSeparator();
    console.log('thief attributes:');
    console.log(JSON.stringify(thiefAttributes, null, 4));
    addSeparator();


    //--------------------------------------------
    //
    let allTidbits = [];
    let tidbitLandmark = {};
    let landmarks = Object.keys(city.landmarks);
    d(landmarks);
    for (let i = 0; i < landmarks.length; i++) {
        let landmark = landmarks[i];
        let tidbits = city.landmarks[landmark].tidbits;
        allTidbits = allTidbits.concat(tidbits);
        for (let j = 0; j < tidbits.length; j++) {
            tidbitLandmark[tidbits[j]] = landmark;
        }
    }

    d(tidbitLandmark);
    let chosenTidbit = getRandomData(allTidbits);
    let chosenLandmark = tidbitLandmark[chosenTidbit];

    console.log('%s', city.description);

    let stolen = getRandomData(city.steal);
    console.log('The master thief has stolen %s', stolen);
    addSeparator();


    // Eating:
    // - looking forward to eating
    // - craving
    // - searching for eating places serving
    // -
    let found = false;
    let correctCity = false;
    let cityChoice = null;
    let nextCorrectCity = data.cities[getRandomData(Object.keys(data.cities))].name;

    while (!found) {
        let person = getRandomData(Object.keys(metadata['person-places']));
        let personAction = getRandomData(metadata['person-actions']) + ' ' + person;

        let place = getRandomData(metadata['person-places'][person]);
        let placeAction = getRandomData(metadata['place-actions']) + ' ' + place;

        d('** %s', personAction);
        d('** %s', placeAction);

        let response;

        while (_.get(response, 'choice') !== 'travel') {
            response = await prompt([{
                type: 'list',
                name: 'choice',
                message: 'What do you want to do?',
                choices: [{
                    name: 'Travel to next destination',
                    value: 'travel'
                }, {
                    name: personAction,
                    value: 'person'
                }, {
                    name: placeAction,
                    value: 'place'
                }, {
                    name: 'Exit game',
                    value: 'exit'
                }],
                validate: validator
            }]);

            if (response.choice === 'exit') {
                console.log('** Bye');
                process.exit();
            }

            if (response.choice === 'travel') {
                let choices = [];
                let rightChoice = getRandomInt(1, 4);
                d('Random int: ' + rightChoice);

                let alreadyAdded = [];
                alreadyAdded.push(nextCorrectCity);

                let i = 1;
                while (choices.length < 3) {
                    if (rightChoice === i) {
                        choices.push({ name: nextCorrectCity, value: rightChoice });
                        i++;
                        continue;
                    }

                    let choice = getRandomData(Object.keys(data.cities));
                    let cityToAdd = data.cities[choice].name;
                    if (alreadyAdded.indexOf(cityToAdd) >= 0) {
                        continue;
                    }

                    alreadyAdded.push(cityToAdd);
                    choices.push({ name: cityToAdd, value: i });

                    i++;
                }
                d(choices);

                addSeparator();
                let answer = await prompt([ {
                    type: 'list',
                    name: 'place',
                    message: 'Which city do you want to travel to?',
                    choices: choices
                }]);
                d(answer);

                cityChoice = answer.place;
                if (cityChoice === rightChoice) {
                    correctCity = true;

                    addSeparator();
                    console.log('Correct city, good job...');
                    addSeparator();

                    city = cityChoice;
                    nextCorrectCity = data.cities[getRandomData(Object.keys(data.cities))].name;
                    while (nextCorrectCity === city) {
                        nextCorrectCity = data.cities[getRandomData(Object.keys(data.cities))].name;
                    }
                } else {
                    correctCity = false;

                    addSeparator();
                    console.log('Wrong city, continue...');
                    addSeparator();
                }
            }
        }
    }

    /*
    console.log('Which landmark am I talking about: ' + chosenTidbit);

    let random = await prompt([ {
        type: 'input',
        name: 'username',
        message: 'What is your user name',
        validate: validator
    }]);
    d(random);

    while (!correct) {
        let choices = [];
        let rightChoice = getRandomInt(1, 4);
        d('Random int: ' + rightChoice);

        let alreadyAdded = [];
        alreadyAdded.push(chosenLandmark);

        let i = 1;
        while (choices.length < 4) {
            if (rightChoice === i) {
                choices.push({ name: chosenLandmark, value: rightChoice });
                i++;
                continue;
            }

            let choice = getRandomInt(0, landmarks.length);
            let landmark = landmarks[choice];
            if (alreadyAdded.indexOf(landmark) >= 0) {
                continue;
            }

            alreadyAdded.push(landmark);
            choices.push({ name: landmark, value: i });

            i++;
        }
        d(choices);

        let answer = await prompt([ {
            type: 'list',
            name: 'answer',
            message: 'Which landmark am I talking about: ' + chosenTidbit,
            choices: choices
        }]);
        d(answer);

        if (answer.answer === rightChoice) {
            console.log('Correct answer, good job...');
            correct = true;
            continue;
        }

        console.log('Wrong answer, try again....');
    }
    */
}


// Simple input validator
function validator(str) {
    return (str && str.length > 0);
}

function addSeparator() {
    console.log('------------------------------------------------------------');
    addNewLines(1);
}

function addNewLines(number) {
    number = number ? number : 1;
    for (let i = 0; i < number; i++) {
        console.log('');
    }
}


function getRandomData(data) {
    e('getRandomData(' + JSON.stringify(data) + ')');
    let length = data.length;
    let index = getRandomInt(0, length - 1);

    d('length: %s, index: %s', length, index);
    let response = data[index];

    ex('getRandomData(' + response + ')');
    return data[index];
}


function getRandomInt(min, max) {
    e('getRandomInt(' + min + ',' + max + ')');
    min = Math.ceil(min);
    max = Math.floor(max);
    let response = Math.floor(Math.random() * (max - min)) + min;
    ex('getRandomInt(' + response + ')');
    return response;
}

function e(str) {
    d_f('Entering index::' + str);
}

function ex(str) {
    d_f('Exiting index::', str);
}