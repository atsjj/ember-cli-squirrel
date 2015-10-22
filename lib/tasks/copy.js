/* jshint node: true */
'use strict';

var chalk   = require('chalk');

var Task    = require('ember-cli/lib/models/task');
var Copier  = require('../models/copier');

module.exports = Task.extend({
  run: function(options) {
    var ui = this.ui;

    var copier = new Copier({
      outputPath: options.outputPath,
      destinationPath: options.destinationPath,
      javascriptsPath: options.javascriptsPath,
      stylesheetsPath: options.stylesheetsPath,
      environment: options.environment,
      project: this.project,
      ui: ui
    });

    ui.pleasantProgress.start(chalk.green('Copying'), chalk.green('.'));

    return copier.copy()
      .finally(function() {
        ui.pleasantProgress.stop();
      })
      .then(function() {
        ui.writeLine(chalk.green('Copied project successfully. Stored in "' +
          options.destinationPath + '".'));
      })
      .catch(function(err) {
        ui.writeLine(chalk.red('Copy failed.'));
        ui.writeError(err);

        return 1;
      });
  }
});
