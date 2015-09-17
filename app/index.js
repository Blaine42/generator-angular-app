'use strict';

var util = require('util'),
	yeoman = require('yeoman-generator'),
	packagejs = require(__dirname + '/../package.json'),
	scriptBase = require(__dirname + '/../script-base'),
	_ = require('underscore.string'),
	chalk = require('chalk'),
	mkdirp = require('mkdirp')

	;


var Generator = module.exports = function Generator(args, options, config) {

    yeoman.generators.Base.apply(this, arguments);

    // this.installDependencies({
    //     skipInstall: options['skip-install'],
    //     callback: this._injectDependenciesAndConstants.bind(this)
    // });
	//
    // this.on('end', function () {
    //     if (this.prodDatabaseType === 'oracle') {
    //         console.log(chalk.yellow.bold('\n\nYou have selected Oracle database.\n') + 'Please place the ' + chalk.yellow.bold('ojdbc-' + this.ojdbcVersion + '.jar') + ' in the `' + chalk.yellow.bold(this.libFolder) + '` folder under the project root. \n');
    //     }
	//
    // });
	//
	//
    // this.pkg = JSON.parse(html.readFileAsString(path.join(__dirname, '../package.json')));
};


util.inherits(Generator, yeoman.generators.Base);
util.inherits(Generator, scriptBase);


Generator.prototype.askFor = function askFor() {
    var cb = this.async();

    console.log(chalk.bold.yellow('\n'+ packagejs.description +' v' + packagejs.version + '\n'));

    var insight = this.insight();
    var questions = 15; // making questions a variable to avoid updating each question by hand when adding additional options

    var prompts = [
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
            type: 'confirm',
            name: 'enableTranslation',
            message: '(15/' + questions + ') Would you like to enable translation support with Angular Translate?',
            default: true
        },
        {
            type: 'list',
            name: 'authenticationType',
            message: '(4/' + questions + ') Which *type* of authentication would you like to use?',
            choices: [
                {
                    value: 'session',
                    name: 'HTTP Session Authentication (stateful, default Spring Security mechanism)'
                },
                {
                    value: 'oauth2',
                    name: 'OAuth2 Authentication (stateless, with an OAuth2 server implementation)'
                },
                {
                    value: 'xauth',
                    name: 'Token-based authentication (stateless, with a token)'
                }
            ],
            default: 0
        }
    ];

    this.baseName = this.config.get('baseName');
    this.enableTranslation = this.config.get('enableTranslation'); // this is enabled by default to avoid conflicts for existing applications
	this.authenticationType = this.config.get('authenticationType');

    if (this.baseName != null &&
		this.authenticationType != null) {
        // If translation is not defined, it is enabled by default
        if (this.enableTranslation == null) {
            this.enableTranslation = true;
        }

        console.log(chalk.green('This is an existing project, using the configuration from your .yo-rc.json file \n' +
            'to re-generate the project...\n'));

        cb();
    }
	else {
        this.prompt(prompts, function (props) {
            if (props.insight !== undefined) {
                insight.optOut = !props.insight;
            }

            this.baseName = props.baseName;
            this.enableTranslation = props.enableTranslation;
			this.authenticationType = props.authenticationType;

            cb();
        }.bind(this));
    }
};




Generator.prototype.app = function app() {

	var webappDir = '';
	mkdirp(webappDir);

	// Application name modified, using each technology's conventions
    this.angularAppName = _.camelize(_.slugify(this.baseName)) + 'App';
    this.camelizedBaseName = _.camelize(this.baseName);
    this.slugifiedBaseName = _.slugify(this.baseName);


	this.template(webappDir + 'scripts/app/app.js', webappDir + 'scripts/app/app.js', this, {});



	this.config.set('baseName', this.baseName);
    this.config.set('authenticationType', this.authenticationType);
    this.config.set('enableTranslation', this.enableTranslation);
};
