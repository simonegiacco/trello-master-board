(function() {
	var app = angular.module('application', [ 'ngResource', 'ngRoute', 'view', 'rest', 'navbar', 'projects', 'tasklists', 'task', 'controls' ]);

	app.config([ '$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

		$routeProvider.when('/projects', {
			templateUrl : 'templates/projects.html',
			controller : 'ProjectsCtrl'
		}).when('/project/:projectId/:taskId?', {
			templateUrl : 'templates/task-lists.html',
			controller : 'TasklistsCtrl',
			reloadOnSearch: false
		}).otherwise({
			redirectTo : '/projects'
		});

		// use the HTML5 History API
		$locationProvider.html5Mode(false); // set to true for servers
	} ]);

})();
