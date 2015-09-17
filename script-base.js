'use strict';
var path = require('path'),
    util = require('util'),
    yeoman = require('yeoman-generator'),
    Insight = require('insight')
    ;

module.exports = Generator;

function Generator() {
    yeoman.generators.NamedBase.apply(this, arguments);
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
}

util.inherits(Generator, yeoman.generators.NamedBase);


Generator.prototype.insight = function () {
    var pkg = require('./package.json');
    var insight = new Insight({
        trackingCode: 'UA-46075199-2',
        packageName: pkg.name,
        packageVersion: pkg.version
    });
    return insight;
}



Generator.prototype.copyJs = function (source, dest, data, _opt, template) {
    _opt = _opt !== undefined ? _opt : {};
    data = data !== undefined ? data : this;
    if (this.enableTranslation) {
        // uses template method instead of copy if template boolean is set as true
        template ? this.template(source, dest, data, _opt) : this.copy(source, dest);
    } else {
        var regex = '[a-zA-Z]+\:(\s)?\[[ \'a-zA-Z0-9\$\,\(\)\{\}\n\.\<\%\=\>\;\s]*\}\]';
        //looks for something like mainTranslatePartialLoader: [*]
        var body = this.stripContent(source, regex, data, _opt);
        body = this.replaceTitle(body, data, template);
        this.write(dest, body);
    }
}
