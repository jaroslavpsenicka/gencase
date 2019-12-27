module.exports = function (grunt) {
    'use strict';

    grunt.registerTask('default',
        ['jasmine_node', 'jshint', 'watch']);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //Tests
        jasmine_node: {
            options: {
                forceExit: true,
                verbose: true
            },
            files: { src: 'test/**/*.spec.js'}
        },

        //Clean code.
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            files: { src: ['index.js', 'lib/**/*.js', 'test/**/*.js']}
        },

        //Files to watch and actions to take when they are changed.
        watch: {
            files: ['index.js', 'lib/**/*.js', 'test/**/*.spec.js'],
            tasks: ['jshint', 'jasmine_node']
        }
    });

    // Load the plugins
    // Watch the file system for changes.
    grunt.loadNpmTasks('grunt-contrib-watch');
    // Runs tests.
    grunt.loadNpmTasks('grunt-jasmine-node');
    // Clean code validator.
    grunt.loadNpmTasks('grunt-contrib-jshint');
};
