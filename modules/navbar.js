(function() {
	var module = angular.module('navbar', [ 'view']);

	module.directive('navbarRight', [ 'ViewService',
			function(ViewService) {
				return {
					restrict : 'E',
					replace : true,
					templateUrl : "templates/navbar-right.html"

				};

			} ]);
	module.controller('navbarCtrl', function ($scope, $http, RestService, ProjectCreateDialogService) {
		var loadCompanies = function(){
					$http({
						method : 'GET',
						url : RestService.getUrl('companies.json'),
						headers : RestService.getHeaders(),
						data : {}
					}).success(function(data, status, headers, cfg) {
						$scope.companyList = data.companies;
					}).error(function(data, status, headers, cfg) {
					});
				};
				
		var loadCategories = function(){
			$http({
				method : 'GET',
				url : RestService.getUrl('projectCategories.json'),
				headers : RestService.getHeaders(),
				data : {}
			}).success(function(data, status, headers, cfg) {
				$scope.categoryList = data.categories;
				
			}).error(function(data, status, headers, cfg) {
			});					
		};

		$scope.showProjectDialog = function(projectId) {	
					//refresh
					loadCompanies();
					loadCategories();
					
					if (!projectId) {
						$scope.projectNew = {};
						ProjectCreateDialogService.show();
					} else {
						$http({
							method : 'GET',
							url : RestService.getUrl('projects/' + projectId + '.json'),
							headers : RestService.getHeaders(),
							data : {}
						}).success(function(data, status, headers, cfg) {
							$scope.projectNew = data.project;
							$scope.projectNew.companyId = data.project.company.id;
							$scope.projectNew.categoryId = data.project.category.id;
							//$scope.projectNew.startDateF = $scope.getFormattedDate(data.project.startDate);
							//$scope.projectNew.endDateF = $scope.getFormattedDate(data.project.endDate);							
							ProjectCreateDialogService.show();
						}).error(function(data, status, headers, cfg) {
						});
					}

				};
	});

})();