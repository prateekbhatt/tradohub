module.exports = function (grunt) {

  var SRC_JS = 'public/js/',
      SRC_CSS = 'public/css/',
      config = require('./config');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      // define the files to lint
      files: ['GruntFile.js'],
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
        separator: ';',
        stripBanners: true,
        // the banner is inserted at the top of the output
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      'tradohub-main-js': {
        // the files to concatenate
        src: [SRC_JS + 'lib/jquery.js',
              SRC_JS + 'lib/bootstrap.min.js',
              SRC_JS + 'lib/select2.min.js',
              SRC_JS + 'lib/bootstrap-fileupload.min.js'],
        // the location of the resulting JS file
        dest: SRC_JS + 'tradohub-main.js',
        nonull: true
      }
    },
    cssmin: {
      'tradohub-main-css': {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
          keepSpecialComments: 0,
          report: 'gzip'
        },
        files: {
          'public/css/tradohub-main.min.css': [
                SRC_CSS + 'bootstrap.css',
                SRC_CSS + 'custom.css',
                SRC_CSS + 'select2.css',
                SRC_CSS + 'select2-bootstrap.css',
                SRC_CSS + 'bootstrap-fileupload.min.css'
              ]
        }
      }
    },
    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      'tradohub-main-js': {
        files: {
          'public/js/tradohub-main.min.js': ['<%= concat["tradohub-main-js"].dest %>']
        }
      }
    },
    s3: {
      options: {
        key: config.aws.key,
        secret: config.aws.secret,
        bucket: config.aws.bucket,
        access: 'public-read'
      },
      dev: {
        // These options override the defaults
        options: {
          encodePaths: true,
          maxOperations: 20
        },
        // Files to be uploaded.
        upload: [
          {
            src: 'important_document.txt',
            dest: 'documents/important.txt',
            gzip: true
          },
          {
            src: 'passwords.txt',
            dest: 'documents/ignore.txt',

            // These values will override the above settings.
            bucket: 'some-specific-bucket',
            access: 'authenticated-read'
          },
          {
            // Wildcards are valid *for uploads only* until I figure out a good implementation
            // for downloads.
            src: 'documents/*.txt',

            // But if you use wildcards, make sure your destination is a directory.
            dest: 'documents/'
          }
        ]
      }
    }

  });
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-s3');
  
  grunt.registerTask('main-css', ['less', 'cssmin:tradohub-main-css']);
  grunt.registerTask('main-js', ['concat:tradohub-main-js', 'uglify:tradohub-main-js']);

};