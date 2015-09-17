'use strict';

var generators = require('yeoman-generator'),
	packagejs = require(__dirname + '/../../package.json'),
	chalk = require('chalk')
	;



module.exports = generators.Base.extend({

	initializing : {
		init: function () {
	
			// console.log(chalk.red('\n' +
		 //        ' _     _   ___   __  _____  ____  ___       __  _____   __    __    _    \n' +
		 //        '| |_| | | | |_) ( (`  | |  | |_  | |_)     ( (`  | |   / /\\  / /`  | |_/ \n' +
		 //        '|_| | |_| |_|   _)_)  |_|  |_|__ |_| \\     _)_)  |_|  /_/--\\ \\_\\_, |_| \\ \n' +
		 //        '                             ____  ___   ___                             \n' +
		 //        '                            | |_  / / \\ | |_)                            \n' +
		 //        '                            |_|   \\_\\_/ |_| \\                            \n' +
		 //        '              _    __    _       __        ___   ____  _      __        \n' +
		 //        '             | |  / /\\  \\ \\  /  / /\\      | | \\ | |_  \\ \\  / ( (`       \n' +
		 //        '           \\_|_| /_/--\\  \\_\\/  /_/--\\     |_|_/ |_|__  \\_\\/  _)_)       \n'));

		    console.log('\n'+packagejs.description+' v' + packagejs.version + '\n');
		},
	},

	prompting: function () {
		var done = this.async();

		var questions = 15;

		this.prompt([
        {
            type: 'input',
            name: 'baseName',
            validate: function (input) {
                if (/^([a-zA-Z0-9_]*)$/.test(input)) return true;
                return 'Your application name cannot contain special characters or a blank space, using the default name instead';
            },
            message: '(1/' + questions + ') What is the base name of your application?',
            default: 'jhipster'
        },
        {
            type: 'input',
            name: 'packageName',
            validate: function (input) {
                if (/^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)) return true;
                return 'The package name you have provided is not a valid Java package name.';
            },
            message: '(2/' + questions + ') What is your default Java package name?',
            default: 'com.mycompany.myapp'
        },
        {
            type: 'list',
            name: 'javaVersion',
            message: '(3/' + questions + ') Do you want to use Java 8?',
            choices: [
                {
                    value: '8',
                    name: 'Yes (use Java 8)'
                },
                {
                    value: '7',
                    name: 'No (use Java 7 - Warning! Cassandra and ElasticSearch support will not be available)'
                }
            ],
            default: 0
        }], function (answers) {
			this.log(answers.name);
			done();
		}.bind(this));
	}
});



