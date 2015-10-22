/* jshint node: true */
'use strict';

var CopyTask  = require('../tasks/copy');
var Promise   = require('rsvp').Promise;

var path      = require('path');
var chalk     = require('chalk');
var quickTemp = require('quick-temp');

module.exports = {
  name: 'ship-it',
  aliases: ['ship'],
  description: 'Build the project and ship it to your destination.',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'production' },
    { name: 'destination-path', type: path, required: true },
    { name: 'javascripts-path', type: path, required: true },
    { name: 'stylesheets-path', type: path, required: true },
    { name: 'verbose', type: Boolean, default: false },
    { name: 'skip-npm', type: Boolean, default: false },
    { name: 'skip-bower', type: Boolean, default: false }
  ],

  config: function() {
    return {
      ui: this.ui,
      analytics: this.analytics,
      project: this.project,
      settings: this.settings
    };
  },

  start: function() {
    return Promise.resolve();
  },

  run: function(options) {
    quickTemp.makeOrRemake(options, 'outputPath');

    var BowerInstall    = this.tasks.BowerInstall;
    var BuildTask       = this.tasks.Build;
    var NpmInstallTask  = this.tasks.NpmInstall;

    var bowerInstall    = new BowerInstall(this.config());
    var buildTask       = new BuildTask(this.config());
    var copyTask        = new CopyTask(this.config());
    var npmInstallTask  = new NpmInstallTask(this.config());

    var packageOptions  = {
      verbose: options.verbose
    };

    var ui = this.ui;

    return this.start()
      .then(function() {
        if (!options.skipNpm) {
          return npmInstallTask.run(packageOptions);
        }
      })
      .then(function() {
        if (!options.skipBower) {
          return bowerInstall.run(packageOptions);
        }
      })
      .then(function() {
        return buildTask.run(options);
      })
      .then(function() {
        return copyTask.run(options);
      })
      .finally(function() {
        quickTemp.remove(options, 'outputPath');
      })
      .then(function() {
        ui.writeLine(chalk.green('Shipped project successfully.'));
      })
      .catch(function(err) {
        ui.writeLine(chalk.red('Shipping failed.'));
        ui.writeError(err);

        return 1;
      });
  }
};
