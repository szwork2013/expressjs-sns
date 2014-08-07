module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify:{
        my_target: {
          files: {
            'public/js/min/tip.js': ['public/js/tip.js']
          }
        }
    },
    jshint: {
      files: ['Gruntfile.js', 'public/js/*.js'],
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    cssmin:{
      minify: {
        src: ['public/css/lion.css'],
        dest: 'public/css/min.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  //grunt.registerTask('js', ['jshint', 'concat', 'uglify']);
  grunt.registerTask('js', ['jshint','uglify']);
  grunt.registerTask('jsmin', ['uglify']);
  grunt.registerTask('css', ['cssmin']);

};
