/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            src: {
                src: ['src/js/*.js'],
                dest: 'web/assets/js/main.js'
            },
            libs: {
                src: [
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/threejs/build/three.js',
                    'bower_components/noisejs/index.js',
                    'bower_components/handlebars/handlebars.js'
                ],
                dest: 'web/assets/js/libs.js'
            }
        },
        uglify: {
            /*options: {
             banner: '<%= banner %>'
             },*/
            src: {
                src: '<%= concat.src.dest %>',
                dest: 'web/assets/js/main.min.js'
            },
            libs: {
                src: '<%= concat.libs.dest %>',
                dest: 'web/assets/js/libs.min.js'
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                browser: true,
                globals: {}
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
        },
        less: {
            dev: {
                options: {},
                files: {
                    "web/assets/css/main.css": "src/less/main.less"
                }
            }
        },
        todo: {
            options: {
                file: 'TODO-compiled.md'
            },
            src: ['src/js/*.js', 'src/less/*.less']
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            js: {
                files: 'src/js/*.js',
                tasks: ['concat', 'uglify', 'todo']
            },
            less: {
                files: 'src/less/*.less',
                tasks: ['less', 'todo']
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-todo');

    // Default task.
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('libs', ['concat:libs', 'uglify:libs']);

};
