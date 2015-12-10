'use strict';

angular.module('PatrimoniTrasparenti', ['ngRoute', 'ngSanitize', 'ui.autocomplete'])
  .config(function(DeclarationsProvider){
    DeclarationsProvider.setEndPoint('//patrimoni.staging.openpolis.it/api');
  })
  .filter('capitalize', function() {
    return function (input, format) {
      if (!input) {
        return input;
      }
      format = format || 'all';
      if (format === 'first') {
        // Capitalize the first letter of a sentence
        return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
      } else {
        var words = input.split(' ');
        var result = [];
        words.forEach(function(word) {
          if (word.length === 2 && format === 'team') {
            // Uppercase team abbreviations like FC, CD, SD
            result.push(word.toUpperCase());
          } else {
            result.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
          }
        });
        return result.join(' ');
      }
    };
  })
  .filter('format_note_completezza', function() {
    return function (input, format) {
      if (!input) {
        return input;
      }
      if (format === 'title') {
        if (input.split(":").length >= 2) {
          return input.split(":")[0].trim();
        } else {
          return input;
        }
      } else if (format === 'body') {
        if (input.split(":").length >= 2) {
          return input.split(":")[1].trim();
        } else {
          return '';
        }
      }
      return input;
    };
  });
