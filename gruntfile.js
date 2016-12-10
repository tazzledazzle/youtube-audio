module.exports = function (grunt) {

	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


	grunt.initConfig({
		

		express: {
			all: {
				options: {
					port: 10040,
					hostname: "0.0.0.0",
					bases: [__dirname],

					livereload: true
					
					}
				}
			},
		watch: {
			all: {
				files: ['**/*.js', '**/*.html', '**/*.css'],
				options: {
					livereload: true
				}
			}
		},

	    open: {
	      all: {
	        // Gets the port from the connect configuration
	        path: 'http://localhost:<%= express.all.options.port%>'
	      }
	    }
	});

	grunt.registerTask('server', [
		'express',
		'open',
		'watch'
	]);
};