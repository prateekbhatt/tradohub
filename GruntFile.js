module.exports = function (grunt) {

var SRC_JS = 'public/js/'
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      // define the files to lint
      files: ['GruntFile.js', 'public/js/controllers.js'],
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
    less: {
      dev: {
        options: {
          paths: ["public/css/less"],
          yuicompress: true
        },
        files: {
          "public/css/bootstrap.css": "public/css/less/bootstrap.less"
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
        src: [SRC_JS + 'lib/angular.min.js',
              SRC_JS + 'lib/angular-resource.min.js',
              SRC_JS + 'app.js',
              SRC_JS + 'services.js',
              SRC_JS + 'controllers.js',
              SRC_JS + 'lib/jquery.js',
              SRC_JS + 'lib/bootstrap.min.js',
              SRC_JS + 'lib/ui-bootstrap.min.js'],
        // the location of the resulting JS file
        dest: SRC_JS + '<%= pkg.name %>.js'
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
  grunt.loadNpmTasks('grunt-contrib-less');
  
  grunt.registerTask('test', ['jshint', 'concat']);
  grunt.registerTask('js', ['concat', 'uglify']);

};