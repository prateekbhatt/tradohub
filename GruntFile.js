module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      // define the files to lint
      files: ['GruntFile.js', 'app.js'],
      // files: ['GruntFile.js', 'app.js', 'models/**/*.js'],
      // configure JSHint (documented at http://www.jshint.com/docs/)
      options: {
          // more options here if you want to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          // laxcomma: false,
          // laxbreak: false,
          require: true
        }
      }
    },
    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: ';'
      },
      dist: {
        // the files to concatenate
        src: ['public/js/lib/angular.min.js',
              'public/js/lib/angular-resource.min.js',
              'public/js/app.js',
              'public/js/services.js',
              'public/js/controllers.js',
              'public/js/lib/jquery.js',
              'public/js/lib/bootstrap.min.js',
              'public/js/lib/ui-bootstrap.min.js'],
        // the location of the resulting JS file
        dest: 'public/js/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'public/js/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');  
  
  grunt.registerTask('test', ['jshint', 'concat']);
  grunt.registerTask('js', ['concat', 'uglify']);

};