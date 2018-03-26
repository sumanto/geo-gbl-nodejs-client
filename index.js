// process.env.DEBUG = process.env.DEBUG ? process.env.DEBUG : 'geo,geo:fine';

let inquirer = require('inquirer');
let fs = require('fs');
let path = require('path');
let d = require('debug')('geo');
let d_f = require('debug')('geo:fine');
let _ = require('lodash');


// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err)
});



main();


// Main entry for the program
async function main() {
    e('main');

    let prompt = inquirer.createPromptModule();

    let cityData = fs.readFileSync(path.join(__dirname, 'data', 'us_cities.json'), 'utf8');
    let cityMetadata = JSON.parse(cityData);

    let gameMetaDatacontents = fs.readFileSync(path.join(__dirname, 'data', 'game_metadata.json'), 'utf8');
    let metadata = JSON.parse(gameMetaDatacontents);

    console.log('Welcome to ' + cityMetadata.title);
    addSeparator();

    console.log('Description: ' + cityMetadata.description);
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
    console.log(cityMetadata.main.welcome);
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
    let city = cityMetadata.cities['Los Angeles'];
    // console.log('You are in %s, also known as %s', city.name, getRandomData(city.nicknames));
    addSeparator();


    //--------------------------------------------
    // Randomly choose attributes for the thief
    //
    let thiefAttributes = {};
    for (let key of Object.keys(metadata.attributes)) {
       let values =  Object.keys(metadata.attributes[key]);
       thiefAttributes[key] = getRandomData(values);
    }

    thiefAttributes.sex = getRandomData([ 'male', 'female' ]);
    let thiefSalutation = (thiefAttributes.sex === 'male') ? 'He' : 'She';

    addSeparator();
    console.log('debug:: thief attributes:');
    console.log(JSON.stringify(thiefAttributes, null, 4));
    addSeparator();


    // let hintsAtrributesToGive = Object.keys(metadata.attributes);


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

    let stolen = getRandomData(city.steal);
    console.log('The master thief has stolen %s', stolen);
    addSeparator();

    let date = new Date();


    let found = false;
    let correctCity = true;
    let cityChoice = null;
    let nextCorrectCity = cityMetadata.cities[getRandomData(Object.keys(cityMetadata.cities))].name;

    let personText;
    let placeText;

    let person;
    let personAction;

    let place;
    let placeAction;

    let newCity = true;

    while (!found) {

        if (newCity) {
            console.log('You are in %s, also known as %s', city.name, getRandomData(city.nicknames));
            console.log('%s', city.description);
            addSeparator();

            person = getRandomData(Object.keys(metadata['person-places']));

            personAction = getRandomData(metadata['person-actions']) + ' ' + person;

            place = getRandomData(metadata['person-places'][person]);
            placeAction = getRandomData(metadata['place-actions']) + ' ' + place;

            personText = null;
            placeText = {};

            newCity = false;
        }

        d('** %s', personAction);
        d('** %s', placeAction);

        console.log('Date: ' + date.toLocaleDateString() + '; Time: ' +  date.toLocaleTimeString());

        let response = await prompt([{
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
                name: 'Enter thief attributes',
                value: 'thief'
            }, {
                name: 'Exit game',
                value: 'exit'
            }],
            validate: validator
        }]);

        console.log('Date: ' + date.toLocaleDateString() + '; Time: ' +  date.toLocaleTimeString());

        if (response.choice === 'exit') {
            console.log('** Bye');
            process.exit();
        }

        // Talk to a person
        if (response.choice === 'person') {
            date = incrementDate(date, 2);

            if (!_.isEmpty(personText)) {
                logPerson(person, personText);
                continue;
            }

            if (correctCity) {
                let landmark = getRandomData(Object.keys(city.landmarks));
                d_f(city.landmarks[landmark]);
                let landmarkText = getRandomData(city.landmarks[landmark].tidbits);
                personText = thiefSalutation + ' talked about ' + landmark + ' - ' + landmarkText;

                let thiefAttr = getRandomData(Object.keys(metadata.attributes));
                let thiefAttrHelp;
                if (thiefAttr === 'hair' || thiefAttr === 'eyes') {
                    thiefAttrHelp = thiefSalutation + ' ' + getRandomData(metadata[thiefAttr + '-sentences-similars']) + ' ' + getRandomData(metadata.attributes[thiefAttr][thiefAttributes[thiefAttr]].similars);
                } else if (thiefAttr === 'hobby') {
                    thiefAttrHelp = thiefSalutation + ' talked about ' + thiefAttributes.hobby;
                } else if (thiefAttr === 'vehicle') {
                    thiefAttrHelp = thiefSalutation + ' wanted to ride a ' + thiefAttributes.vehicle;
                } else if (thiefAttr === 'feature') {
                    thiefAttrHelp = thiefSalutation + ' ' + getRandomData(metadata.attributes.feature[thiefAttributes.feature]);
                } else if (thiefAttr === 'food') {
                    thiefAttrHelp = thiefSalutation + ' ' + getRandomData(metadata['food-sentences']) + ' ' + getRandomData(metadata.attributes.food[thiefAttributes.food]);
                }

                personText += ' ' + thiefAttrHelp;
            } else {
                personText = getRandomData(metadata['wrong-person'].person);
            }

            logPerson(person, personText);
        }

        // Go to a place
        if (response.choice === 'place') {
            date = incrementDate(date, 4);

            if (!_.isEmpty(placeText)) {
                logItem(placeText);
                continue;
            }

            placeText.item = getRandomData(Object.keys(metadata['evidence-items']));
            placeText.city = city.name;
            placeText.day = date.toLocaleDateString();
            placeText.time = date.toLocaleTimeString();

            if (correctCity) {
                let landmark = getRandomData(Object.keys(city.landmarks));
                d_f(city.landmarks[landmark]);
                let landmarkText = getRandomData(city.landmarks[landmark].tidbits);
                placeText.additionalText = 'The ' + placeText.item + ' contained an advertisement for ' + landmark + ' - ' + landmarkText;
            } else {
                d(metadata['evidence-items']);
                d(metadata['evidence-items'][placeText.item]);
                if (metadata['evidence-items'][placeText.item].wrong.length > 0) {
                    placeText.additionalText = getRandomData(metadata['evidence-items'][placeText.item].wrong);
                } else {
                    placeText.additionalText = '';
                }
            }

            logItem(placeText);
        }

        // Enter attributes for thief
        if (response.choice === 'thief') {

        }

        // Choose next place
        if (response.choice === 'travel') {
            let choices = [];
            let rightChoice = getRandomInt(1, 4);
            d('Random int: ' + rightChoice);

            let alreadyAdded = [];
            let choiceFlights = {};
            choiceFlights[nextCorrectCity] = Math.floor(Math.random() * 1000) + 1000;

            alreadyAdded.push(nextCorrectCity);

            let i = 1;
            while (choices.length < 3) {
                if (rightChoice === i) {
                    choices.push({
                        name: nextCorrectCity + '; flight #: ' + choiceFlights[nextCorrectCity],
                        value: nextCorrectCity
                    });
                    i++;
                    continue;
                }

                let choice = getRandomData(Object.keys(cityMetadata.cities));
                let cityToAdd = cityMetadata.cities[choice].name;
                if (alreadyAdded.indexOf(cityToAdd) >= 0) {
                    continue;
                }

                alreadyAdded.push(cityToAdd);
                choiceFlights[cityToAdd] = Math.floor(Math.random() * 1000) + 1000;
                choices.push({
                    name: cityToAdd + '; flight #: ' + choiceFlights[cityToAdd],
                    value: cityToAdd
                });

                i++;
            }
            d(choices);

            addSeparator();
            let answer = await prompt([{
                type: 'list',
                name: 'place',
                message: 'Which city do you want to travel to?',
                choices: choices
            }]);
            d(answer);

            newCity = true;
            date = incrementDate(date, 10);

            cityChoice = answer.place;

            if (cityChoice === nextCorrectCity) {
                correctCity = true;

                addSeparator();
                console.log('debug:: Correct city, good job...');
                addSeparator();

                nextCorrectCity = cityMetadata.cities[getRandomData(Object.keys(cityMetadata.cities))].name;
                while (nextCorrectCity === city) {
                    nextCorrectCity = cityMetadata.cities[getRandomData(Object.keys(cityMetadata.cities))].name;
                }
            } else {
                correctCity = false;

                addSeparator();
                console.log('debug:: Wrong city, continue...');
                addSeparator();
            }

            city = cityMetadata.cities[cityChoice];

            let flightNumber = choiceFlights[city.name];

            addSeparator();
            console.log('Your reservation has been confirmed for flight number ' + flightNumber + ' to ' + cityChoice + '. ' + getRandomData(metadata.flight.line2));
            addSeparator();
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


function logPerson(person, personText) {
    addSeparator();

    console.log('***** ' + person + ' said: ' + personText);

    addSeparator();
}


function logItem(placeText) {
    addSeparator();

    console.log('***** Evidence report:');
    console.log('> Date: ' + placeText.day);
    console.log('> Time: ' + placeText.time);
    console.log('> Location: ' + placeText.city);
    console.log('> Item: ' + placeText.item);
    console.log('> Description: ' + placeText.additionalText);

    addSeparator();
}


function incrementDate(date, hours) {
    let dateTime = date.getTime();
    dateTime += (hours * 60 * 60 * 1000);
    date = new Date(dateTime);

    // If later then 7pm, start again at 8 am
    if (date.getHours() >= 19) {
        date.setDate(date.getDate() + 1);
        date.setHours(8);
    }

    return date;
}