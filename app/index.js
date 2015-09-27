'use strict';

var
    util       = require('util'),
    path       = require('path'),
    yeoman     = require('yeoman-generator'),
    packagejs  = require(__dirname + '/../package.json'),
    scriptBase = require(__dirname + '/../script-base'),
    _          = require('underscore.string'),
    chalk      = require('chalk'),
    mkdirp     = require('mkdirp'),
    html       = require("html-wiring"),
    ejs        = require('ejs')
	;


var Generator = module.exports = function Generator(args, options, config) {

    yeoman.generators.Base.apply(this, arguments);

    this.installDependencies({
        skipInstall: options['skip-install'],
        callback: this._injectDependenciesAndConstants.bind(this)
    });

    this.pkg = JSON.parse(html.readFileAsString(path.join(__dirname, '../package.json')));
};


util.inherits(Generator, yeoman.generators.Base);
util.inherits(Generator, scriptBase);


Generator.prototype.askFor = function askFor() {

    console.log(chalk.bold.yellow('\n'+ packagejs.description +' v' + packagejs.version + '\n'));

    var cb        = this.async();
    var insight   = this.insight();
    var questions = 4; // making questions a variable to avoid updating each question by hand when adding additional options

    var prompts = [
        {
            type: 'input',
            name: 'baseName',
            validate: function (input) {
                if (/^([a-zA-Z0-9_]*)$/.test(input)) return true;
                return 'Your application name cannot contain special characters or a blank space, using the default name instead';
            },
            message: '(1/' + questions + ') What is the base name of your application?',
            default: 'webapp'
        },
        {
            type: 'list',
            name: 'authenticationType',
            message: '(2/' + questions + ') Which *type* of authentication would you like to use?',
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
        },
        {
            type: 'confirm',
            name: 'enableTranslation',
            message: '(3/' + questions + ') Would you like to enable translation support with Angular Translate?',
            default: true
        },
        {
            type: 'confirm',
            name: 'enableBootswatch',
            message: '(4/' + questions + ') Would you like to enable an bootswatch themes?',
            default: true
        }
    ];

    this.baseName             = this.config.get('baseName');
    this.enableTranslation    = this.config.get('enableTranslation'); // this is enabled by default to avoid conflicts for existing applications
    this.authenticationType   = this.config.get('authenticationType');
    this.enableBootswatch     = this.config.get('enableBootswatch');


    if (this.baseName != null &&
		this.authenticationType != null &&
        this.enableBootswatch != null) {
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

            this.baseName             = props.baseName;
            this.enableTranslation    = props.enableTranslation;
			this.authenticationType   = props.authenticationType;
            this.enableBootswatch     = props.enableBootswatch;

            cb();
        }.bind(this));
    }
};


Generator.prototype.app = function app() {

	var webappDir = 'webapp/';

    // Application name modified, using each technology's conventions
    this.angularAppName    = _.camelize(_.slugify(this.baseName)) + 'App';
    this.camelizedBaseName = _.camelize(this.baseName);
    this.slugifiedBaseName = _.slugify(this.baseName);


    this.template('_package.json', 'package.json', this, {});
    this.template('_bower.json', 'bower.json', this, {});
    this.template('_README.md', 'README.md', this, {});
    // this.template('bowerrc', '.bowerrc', this, {});
    // this.copy('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');

    this.template('Gruntfile.js', 'Gruntfile.js', this, {});

    this.copy(webappDir + '/assets/styles/main.css', 'assets/styles/main.css');

    this.copy(webappDir + 'assets/styles/documentation.css', 'assets/styles/documentation.css');

    // Images
    this.copy(webappDir + 'assets/images/development_ribbon.png', 'assets/images/development_ribbon.png');
    this.copy(webappDir + 'assets/images/hipster.png', 'assets/images/hipster.png');
    this.copy(webappDir + 'assets/images/hipster2x.png', 'assets/images/hipster2x.png');

    // HTML5 BoilerPlate
    this.copy(webappDir + 'favicon.ico', 'favicon.ico');
    this.copy(webappDir + 'robots.txt', 'robots.txt');
    this.copy(webappDir + 'htaccess.txt', '.htaccess');
    this.copy(webappDir + '404.html', '404.html');

    // install all files related to i18n if translation is enabled
    if (this.enableTranslation) {
        this.installI18nFilesByLanguage(this, webappDir, '', 'en');
        this.installI18nFilesByLanguage(this, webappDir, '', 'fr');
    }

    // Angular JS views

    this.template(webappDir + '/scripts/app/_app.js', 'scripts/app/app.js', this, {});
    // Client Components
    this.template(webappDir + '/scripts/components/auth/_auth.service.js', 'scripts/components/auth/auth.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/_principal.service.js', 'scripts/components/auth/principal.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/_authority.directive.js', 'scripts/components/auth/authority.directive.js', this, {});
    if (this.authenticationType == 'oauth2') {
        this.template(webappDir + '/scripts/components/auth/provider/_auth.oauth2.service.js', 'scripts/components/auth/provider/auth.oauth2.service.js', this, {});
    } else if (this.authenticationType == 'xauth') {
        this.template(webappDir + '/scripts/components/auth/provider/_auth.xauth.service.js', 'scripts/components/auth/provider/auth.xauth.service.js', this, {});
    } else {
        this.template(webappDir + '/scripts/components/auth/provider/_auth.session.service.js', 'scripts/components/auth/provider/auth.session.service.js', this, {});
    }
    this.template(webappDir + '/scripts/components/auth/services/_account.service.js', 'scripts/components/auth/services/account.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/services/_activate.service.js', 'scripts/components/auth/services/activate.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/services/_password.service.js', 'scripts/components/auth/services/password.service.js', this, {});
    this.template(webappDir + '/scripts/components/auth/services/_register.service.js', 'scripts/components/auth/services/register.service.js', this, {});
    if (this.authenticationType == 'session') {
        this.template(webappDir + '/scripts/components/auth/services/_sessions.service.js', 'scripts/components/auth/services/sessions.service.js', this, {});
    }
    this.template(webappDir + '/scripts/components/form/_form.directive.js', 'scripts/components/form/form.directive.js', this, {});
    this.template(webappDir + '/scripts/components/form/_maxbytes.directive.js', 'scripts/components/form/maxbytes.directive.js', this, {});
    this.template(webappDir + '/scripts/components/form/_minbytes.directive.js', 'scripts/components/form/minbytes.directive.js', this, {});
    this.template(webappDir + '/scripts/components/form/_pager.directive.js', 'scripts/components/form/pager.directive.js', this, {});
    this.template(webappDir + '/scripts/components/form/_pager.html', 'scripts/components/form/pager.html', this, {});
    this.template(webappDir + '/scripts/components/form/_pagination.directive.js', 'scripts/components/form/pagination.directive.js', this, {});
    this.template(webappDir + '/scripts/components/form/_pagination.html', 'scripts/components/form/pagination.html', this, {});
    if (this.enableTranslation) {
        this.template(webappDir + '/scripts/components/language/_language.controller.js', 'scripts/components/language/language.controller.js', this, {});
        this.template(webappDir + '/scripts/components/language/_language.service.js', 'scripts/components/language/language.service.js', this, {});
    }
    this.template(webappDir + '/scripts/components/navbar/_navbar.directive.js', 'scripts/components/navbar/navbar.directive.js', this, {});
    this.copyHtml(webappDir + '/scripts/components/navbar/navbar.html', 'scripts/components/navbar/navbar.html');
    this.template(webappDir + '/scripts/components/navbar/_navbar.controller.js', 'scripts/components/navbar/navbar.controller.js', this, {});
    this.template(webappDir + '/scripts/components/user/_user.service.js', 'scripts/components/user/user.service.js', this, {});
    this.template(webappDir + '/scripts/components/util/_base64.service.js', 'scripts/components/util/base64.service.js', this, {});
    this.template(webappDir + '/scripts/components/util/_parse-links.service.js', 'scripts/components/util/parse-links.service.js', this, {});
    this.template(webappDir + '/scripts/components/util/_truncate.filter.js', 'scripts/components/util/truncate.filter.js', this, {});
    this.template(webappDir + '/scripts/components/util/_dateutil.service.js', 'scripts/components/util/dateutil.service.js', this, {});

    // Client App
    this.template(webappDir + '/scripts/app/account/_account.js', 'scripts/app/account/account.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/account/activate/activate.html', 'scripts/app/account/activate/activate.html');
    this.copyJs(webappDir + '/scripts/app/account/activate/_activate.js', 'scripts/app/account/activate/activate.js', this, {});
    this.template(webappDir + '/scripts/app/account/activate/_activate.controller.js', 'scripts/app/account/activate/activate.controller.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/account/login/login.html', 'scripts/app/account/login/login.html');
    this.copyJs(webappDir + '/scripts/app/account/login/_login.js', 'scripts/app/account/login/login.js', this, {});
    this.template(webappDir + '/scripts/app/account/login/_login.controller.js', 'scripts/app/account/login/login.controller.js', this, {});
    this.copyJs(webappDir + '/scripts/app/account/logout/_logout.js', 'scripts/app/account/logout/logout.js', this, {});
    this.template(webappDir + '/scripts/app/account/logout/_logout.controller.js', 'scripts/app/account/logout/logout.controller.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/account/password/password.html', 'scripts/app/account/password/password.html');
    this.copyJs(webappDir + '/scripts/app/account/password/_password.js', 'scripts/app/account/password/password.js', this, {});
    this.template(webappDir + '/scripts/app/account/password/_password.controller.js', 'scripts/app/account/password/password.controller.js', this, {});
    this.template(webappDir + '/scripts/app/account/password/_password.directive.js', 'scripts/app/account/password/password.directive.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/account/register/register.html', 'scripts/app/account/register/register.html');
    this.copyJs(webappDir + '/scripts/app/account/register/_register.js', 'scripts/app/account/register/register.js', this, {});
    this.template(webappDir + '/scripts/app/account/register/_register.controller.js', 'scripts/app/account/register/register.controller.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/account/reset/request/reset.request.html', 'scripts/app/account/reset/request/reset.request.html');
    this.copyJs(webappDir + '/scripts/app/account/reset/request/_reset.request.js', 'scripts/app/account/reset/request/reset.request.js', this, {});
    this.template(webappDir + '/scripts/app/account/reset/request/_reset.request.controller.js', 'scripts/app/account/reset/request/reset.request.controller.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/account/reset/finish/reset.finish.html', 'scripts/app/account/reset/finish/reset.finish.html');
    this.copyJs(webappDir + '/scripts/app/account/reset/finish/_reset.finish.js', 'scripts/app/account/reset/finish/reset.finish.js', this, {});
    this.template(webappDir + '/scripts/app/account/reset/finish/_reset.finish.controller.js', 'scripts/app/account/reset/finish/reset.finish.controller.js', this, {});
    if (this.authenticationType == 'session') {
        this.copyHtml(webappDir + '/scripts/app/account/sessions/sessions.html', 'scripts/app/account/sessions/sessions.html');
        this.copyJs(webappDir + '/scripts/app/account/sessions/_sessions.js', 'scripts/app/account/sessions/sessions.js', this, {});
        this.template(webappDir + '/scripts/app/account/sessions/_sessions.controller.js', 'scripts/app/account/sessions/sessions.controller.js', this, {});
    }
    this.copyHtml(webappDir + '/scripts/app/account/settings/settings.html', 'scripts/app/account/settings/settings.html');
    this.copyJs(webappDir + '/scripts/app/account/settings/_settings.js', 'scripts/app/account/settings/settings.js', this, {});
    this.template(webappDir + '/scripts/app/account/settings/_settings.controller.js', 'scripts/app/account/settings/settings.controller.js', this, {});

    this.copyHtml(webappDir + '/scripts/app/error/error.html', 'scripts/app/error/error.html');
    this.copyHtml(webappDir + '/scripts/app/error/accessdenied.html', 'scripts/app/error/accessdenied.html');
    this.copyJs(webappDir + '/scripts/app/entities/_entity.js', 'scripts/app/entities/entity.js', this, {});
    this.copyJs(webappDir + '/scripts/app/error/_error.js', 'scripts/app/error/error.js', this, {});
    this.copyHtml(webappDir + '/scripts/app/main/main.html', 'scripts/app/main/main.html');
    this.copyJs(webappDir + '/scripts/app/main/_main.js', 'scripts/app/main/main.js', this, {});
    this.template(webappDir + '/scripts/app/main/_main.controller.js', 'scripts/app/main/main.controller.js', this, {});

    // interceptor code
    this.template(webappDir + '/scripts/components/interceptor/_auth.interceptor.js', 'scripts/components/interceptor/auth.interceptor.js', this, {});
    this.template(webappDir + '/scripts/components/interceptor/_errorhandler.interceptor.js', 'scripts/components/interceptor/errorhandler.interceptor.js', this, {});
    this.template(webappDir + '/scripts/components/interceptor/_notification.interceptor.js', 'scripts/components/interceptor/notification.interceptor.js', this, {});

    //alert service code
    this.template(webappDir + '/scripts/components/alert/_alert.service.js', 'scripts/components/alert/alert.service.js', this, {});
    this.template(webappDir + '/scripts/components/alert/_alert.directive.js', 'scripts/components/alert/alert.directive.js', this, {});

    // bootswatch themes
    if(this.enableBootswatch) {
        this.template(webappDir + '/scripts/components/util/bootswatch/_bootswatch.service.js', 'scripts/components/util/bootswatch/bootswatch.service.js', this, {});
        this.template(webappDir + '/scripts/components/util/bootswatch/_bootswatch.directive.js', 'scripts/components/util/bootswatch/bootswatch.directive.js', this, {});
        this.template(webappDir + '/scripts/components/util/bootswatch/_bootswatch.controller.js', 'scripts/components/util/bootswatch/bootswatch.controller.js', this, {});
    }

    // Index page
    this.indexFile = html.readFileAsString(path.join(this.sourceRoot(), webappDir + '_index.html'));
    this.engine = require('ejs').render;
    this.indexFile = this.engine(this.indexFile, this, {});



    var appScripts = [
        'scripts/app/app.js',
        'scripts/app/app.constants.js',
        'scripts/components/auth/auth.service.js',
        'scripts/components/auth/principal.service.js',
        'scripts/components/auth/authority.directive.js',
        'scripts/components/auth/services/account.service.js',
        'scripts/components/auth/services/activate.service.js',
        'scripts/components/auth/services/password.service.js',
        'scripts/components/auth/services/register.service.js',
        'scripts/components/form/form.directive.js',
        'scripts/components/form/maxbytes.directive.js',
        'scripts/components/form/minbytes.directive.js',
        'scripts/components/form/pager.directive.js',
        'scripts/components/form/pagination.directive.js',
        'scripts/components/interceptor/auth.interceptor.js',
        'scripts/components/interceptor/errorhandler.interceptor.js',
        'scripts/components/interceptor/notification.interceptor.js',
        'scripts/components/navbar/navbar.directive.js',
        'scripts/components/navbar/navbar.controller.js',
        'scripts/components/user/user.service.js',
        'scripts/components/util/truncate.filter.js',
        'scripts/components/util/base64.service.js',
        'scripts/components/alert/alert.service.js',
        'scripts/components/alert/alert.directive.js',
        'scripts/components/util/parse-links.service.js',
        'scripts/components/util/dateutil.service.js',
        'scripts/app/account/account.js',
        'scripts/app/account/activate/activate.js',
        'scripts/app/account/activate/activate.controller.js',
        'scripts/app/account/login/login.js',
        'scripts/app/account/login/login.controller.js',
        'scripts/app/account/logout/logout.js',
        'scripts/app/account/logout/logout.controller.js',
        'scripts/app/account/password/password.js',
        'scripts/app/account/password/password.controller.js',
        'scripts/app/account/password/password.directive.js',
        'scripts/app/account/register/register.js',
        'scripts/app/account/register/register.controller.js',
        'scripts/app/account/settings/settings.js',
        'scripts/app/account/settings/settings.controller.js',
        'scripts/app/account/reset/finish/reset.finish.controller.js',
        'scripts/app/account/reset/finish/reset.finish.js',
        'scripts/app/account/reset/request/reset.request.controller.js',
        'scripts/app/account/reset/request/reset.request.js',
        'scripts/app/entities/entity.js',
        'scripts/app/error/error.js',
        'scripts/app/main/main.js',
        'scripts/app/main/main.controller.js'
    ];

    if (this.enableTranslation) {
        appScripts = appScripts.concat([
            'bower_components/messageformat/locale/en.js',
            'bower_components/messageformat/locale/fr.js',
            'scripts/components/language/language.service.js',
            'scripts/components/language/language.controller.js']);
    }
    if (this.authenticationType == 'xauth') {
        appScripts = appScripts.concat([
            'scripts/components/auth/provider/auth.xauth.service.js']);
    }

    if (this.authenticationType == 'oauth2') {
        appScripts = appScripts.concat([
            'scripts/components/auth/provider/auth.oauth2.service.js']);
    }

    if (this.authenticationType == 'session') {
        appScripts = appScripts.concat([
            'scripts/components/auth/services/sessions.service.js',
            'scripts/components/auth/provider/auth.session.service.js',
            'scripts/app/account/sessions/sessions.js',
            'scripts/app/account/sessions/sessions.controller.js']);
    }

    if(this.enableBootswatch) {
        appScripts = appScripts.concat([
            'scripts/components/util/bootswatch/bootswatch.service.js',
            'scripts/components/util/bootswatch/bootswatch.directive.js',
            'scripts/components/util/bootswatch/bootswatch.controller.js']);
    }

    this.indexFile = html.appendScripts(this.indexFile, 'scripts/app.js', appScripts, {}, ['.tmp', './']);
    this.write('index.html', this.indexFile);


    // Create Test Javascript files
    var testJsDir = 'test/';
    var testJsDirSrc = webappDir + '/' +testJsDir;
    this.template(testJsDirSrc + '_karma.conf.js', testJsDir + 'karma.conf.js');
    this.template(testJsDirSrc + 'spec/app/_app.run.spec.js', testJsDir + 'spec/app/app.run.spec.js', this, {});
    this.template(testJsDirSrc + 'spec/app/_app.config.spec.js', testJsDir + 'spec/app/appc.onfig.spec.js', this, {});
    this.template(testJsDirSrc + 'spec/app/main/_main.spec.js', testJsDir + 'spec/app/main/main.spec.js', this, {});
    this.template(testJsDirSrc + 'spec/app/main/_main.controller.spec.js', testJsDir + 'spec/app/main/main.controller.spec.js', this, {});


	this.config.set('baseName', this.baseName);
    this.config.set('authenticationType', this.authenticationType);
    this.config.set('enableTranslation', this.enableTranslation);
    this.config.set('enableBootswatch', this.enableBootswatch);
};



Generator.prototype._injectDependenciesAndConstants = function _injectDependenciesAndConstants() {
    if (this.options['skip-install']) {
        this.log(
            'After running `npm install & bower install`, inject your front end dependencies' +
            '\ninto your source code by running:' +
            '\n' +
            '\n' + chalk.yellow.bold('grunt wiredep') +
            '\n' +
            '\n ...and generate the Angular constants with:' +
            '\n' + chalk.yellow.bold('grunt ngconstant:dev')
        );
    }
    else {
        this.spawnCommand('grunt', ['ngconstant:dev', 'wiredep']);
    }
};
