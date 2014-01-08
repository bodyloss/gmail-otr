"use strict";

module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                stripBanners: true,
                seperator: ';',
            },
            dist: {
                src: [
                    'otr/build/deb/salsa20.js', 
                    'otr/build/deb/bigint.js', 
                    'otr/build/deb/crypto.js', 
                    'otr/build/dep/eventemitter.js', 
                    'otr/build/otr.js',
                    'userscript.js'
                ],
                dest: 'build/gmail-otr.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */\n',
            },
            dist: {
                files: {
                    'build/gmail-otr.min.js': 'build/gmail-otr.js'
                }
            },            
        }
    });


    grunt.registerTask('default', ['concat', 'uglify']);
};
