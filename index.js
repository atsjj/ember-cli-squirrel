/* jshint node: true */
'use strict';

var commands = require('./lib/commands');

module.exports = {
  name: 'ember-cli-squirrel',

  includedCommands: function() {
    return commands;
  }
};
