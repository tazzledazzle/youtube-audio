var myApp = angular.module('flagApp', ['ngRoute']);

myApp.config(function ($routeProvider){
	$routeProvider
		.when('/', {
			controller: 'BaseController',
			templateUrl: 'partials/welcome.html'
		})
		.when('/tutorials', {
			controller: 'TutorialsController',
			templateUrl: 'partials/tutorials.html'
		})
		.when('/misc', {
			controller: 'MiscController',
			templateUrl: 'partials/misc.html'
		})
		.when('/photos', {
			controller: 'PhotoController',
			templateUrl: 'partials/photos.html'
		})
		.otherwise({ redirectTo: '/'});
});

var controllers = {};

controllers['BaseController'] = function BaseController($scope) {
	//todo
};
controllers['TutorialsController'] = function TutorialsController($scope) {
	//todo
}
controllers['MiscController'] = function MiscController($scope) {
	//todo
}
controllers['PhotoController'] = function PhotoController($scope) {
	//todo
}

myApp.controller(controllers);