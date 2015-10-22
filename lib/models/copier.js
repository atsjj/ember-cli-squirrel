/* jshint node: true */
'use strict';


var Funnel      = require('broccoli-funnel');
var Promise     = require('rsvp').Promise;
var Task        = require('ember-cli/lib/models/task');

var broccoli    = require('broccoli');
var chalk       = require('chalk');
var fs          = require('fs-extra');
var mergeTrees  = require('broccoli-merge-trees');
var ncp         = require('ncp').ncp;
var path        = require('path');

module.exports = Task.extend({
  init: function() {
    this.builder = new broccoli.Builder(this.tree());
  },

  pick: function(sourceDirectory, destinationDirectory, files) {
    return new Funnel(this.outputPath, {
      srcDir: sourceDirectory,
      include: files,
      destDir: destinationDirectory
    });
  },

  tree: function() {
    var javascripts = this.pick('/assets', this.javascriptsPath, [ new RegExp('^.*\.(js|json)$') ]);
    var stylesheets = this.pick('/assets', this.stylesheetsPath, [ new RegExp('^.*\.(css|json)$') ]);

    return mergeTrees([javascripts, stylesheets]);
  },

  sync: function(results) {
    var inputPath = results.directory;
    var outputPath = path.resolve(this.destinationPath);
    var javascriptsPath = path.resolve(path.join(this.destinationPath, this.javascriptsPath));
    var stylesheetsPath = path.resolve(path.join(this.destinationPath, this.stylesheetsPath));
    var options = {
      clobber: true,
      dereference: true,
      stopOnErr: true
    };

    if (fs.existsSync(javascriptsPath)) {
      this.ui.writeLine([
          chalk.white('Removed the'),
          chalk.green(javascriptsPath),
          chalk.white('directory.')
        ].join(' '));
      // fs.removeSync(javascriptsPath);
    } else {
      this.ui.writeLine([
          chalk.white('Could not find the'),
          chalk.green(javascriptsPath),
          chalk.white('directory.')
        ].join(' '));
    }

    if (fs.existsSync(stylesheetsPath)) {
      this.ui.writeLine([
          chalk.white('Removed the'),
          chalk.green(stylesheetsPath),
          chalk.white('directory.')
        ].join(' '));
      // fs.removeSync(stylesheetsPath);
    } else {
      this.ui.writeLine([
          chalk.white('Could not find the'),
          chalk.green(stylesheetsPath),
          chalk.white('directory.')
        ].join(' '));
    }

    return new Promise(function(resolve, reject) {
      resolve();
      // ncp(inputPath, outputPath, options, function(err) {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     resolve();
      //   }
      // });
    });
  },

  copy: function() {
    var self = this;
    var ui = this.ui;

    return this.builder.build()
      .then(function() {
        return self.sync.apply(self, arguments);
      })
      .finally(function() {
        return self.builder.cleanup();
      });
  }
});
