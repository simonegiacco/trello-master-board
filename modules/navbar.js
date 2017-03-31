(function() {
	var module = angular.module('navbar', [ 'view' ]);

	module.directive('navbarRight', [ 'ViewService',
			function(ViewService) {
				return {
					restrict : 'E',
					replace : true,
					templateUrl : "templates/navbar-right.html"

				};

			} ]);

})();