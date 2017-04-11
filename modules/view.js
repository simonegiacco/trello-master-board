(function() {
	var module = angular.module('view', []);

	module.service('ViewService', [ '$window', function($window) {
		this.currentView = 'home';
		this.currentConfig = {};

		this.isCurrentView = function(viewName) {
			// jstracer.write("Compare " + this.currentView + " to " +
			// viewName);
			return this.getCurrentView() === viewName;
		};

		this.setCurrentView = function(viewName) {
			console.log("Set " + this.currentView + " to " + viewName);
			this.currentView = viewName;
			this.currentConfig = {};
			$window.location.href = '#/' + viewName;
		};

		this.setCurrentView = function(viewName, viewConfig) {
			console.log("Set " + this.currentView + " to " + viewName);
			this.currentView = viewName;
			this.currentConfig = viewConfig;
			$window.location.href = '#/' + viewName;
		};

		this.setViewByLocation = function() {
			var rightpart = $window.location.href.split('#')[1];
			if (typeof rightpart != 'undefined') {
				this.currentView = rightpart.split('/')[1];
			}
		};

		this.getCurrentView = function() {
			var rightpart = $window.location.href.split('#')[1];
			if (typeof rightpart != 'undefined') {
				this.currentView = rightpart.split('/')[1];
			}
			return this.currentView;
		};
		
		this.getCurrentConfig = function() {
			return this.currentConfig;
		};

		this.setViewByLocation();
	} ]);
	
	
	

	module.controller('ViewCtrl', [ '$scope', 'ViewService',
			function($scope, ViewService) {
				$scope.isCurrentView = function(viewName) {
					return ViewService.isCurrentView(viewName);
				};

				$scope.setCurrentView = function(viewName) {
					// jstracer.write("Ctrl " + viewName);
					ViewService.setCurrentView(viewName);
				};

			} ]);

	

})();