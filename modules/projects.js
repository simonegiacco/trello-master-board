(function() {
	var module = angular.module('projects', [ 'rest', 'view' ]);

	module.controller('ProjectsCtrl', [ '$scope', 'ViewService', 'RestService', '$http', '$routeParams', 'ProjectCreateDialogService',
			function($scope, ViewService, RestService, $http, $routeParams, ProjectCreateDialogService) {
				$scope.projects = [];
				$scope.projectNew = {};
				$scope.selectedCompanyId = -1;
				$scope.selectedCategoryId = -1;

				$scope.loadProjects = function() {
					$scope.loading = true;
					$http({
						method : 'GET',
						url : RestService.getUrl('projects.json'),
						headers : RestService.getHeaders(),
						data : {}
					}).success(function(data, status, headers, cfg) {
						$scope.projects = data.projects;
						$scope.loading = false;
					}).error(function(data, status, headers, cfg) {
						$scope.loading = false;
					});
				};

				$scope.getFormattedDate = function(rawDate) {
					if (rawDate == null || rawDate == '') {
						return 'none';
					}
					var jsDate = new Date(rawDate);
					var dd = jsDate.getDate();
					if (dd < 10) {
						dd = '0' + dd;
					}
					var mm = jsDate.getMonth()+1;//january is 0. As always
					if (mm < 10) {
						mm = '0' + mm
					}
					return dd + '.' + mm + '.' + jsDate.getFullYear();
				};
				
				$scope.parseDate = function(strDate){
					if(strDate == null || strDate==""){
						return '';
					}
					var dd = strDate.substring(0,2);
					var mm = strDate.substring(3,5);
					var yyyy = strDate.substring(6,10);
					return yyyy+mm+dd;
				}

				$scope.saveProject = function() {
					var method = 'POST';
					var operator = 'projects.json';
					if ($scope.projectNew.id) {
						method = 'PUT';
						operator = 'projects/' + $scope.projectNew.id + '.json';
					}

					$scope.projectNew.startDate = $scope.parseDate($scope.projectNew.startDateF);
					$scope.projectNew.endDate = $scope.parseDate($scope.projectNew.endDateF);
					console.log($scope.projectNew.startDateF+';'+$scope.projectNew.endDateF)
					console.log($scope.projectNew.startDate+';'+$scope.projectNew.endDate)
					$scope.projectNew["category-id"] = $scope.projectNew.categoryId;
					$http({
						method : method,
						url : RestService.getUrl(operator),
						headers : RestService.getHeaders(),
						data : {
							project : $scope.projectNew
						}
					}).success(function(data, status, headers, cfg) {
						$scope.loadProjects();
						$scope.projectNew = {};
						ProjectCreateDialogService.hide();
					}).error(function(data, status, headers, cfg) {
					});
				};
				
				$scope.loadCompanies = function(){
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
				
				$scope.loadCategories = function(){
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

				
				$scope.loadProjects();
				$scope.loadCompanies();
				$scope.loadCategories();
				
				$scope.companyFilter = function(cmpId){
					//$scope.selectedCompanyId = cmpId;
					//$scope.apply();
					console.log($scope.selectedCompanyId);
				};
				
				$scope.showProjectDialog = function(projectId) {	
					//refresh
					$scope.loadCompanies();
					$scope.loadCategories();
					
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
							$scope.projectNew.startDateF = $scope.getFormattedDate(data.project.startDate);
							$scope.projectNew.endDateF = $scope.getFormattedDate(data.project.endDate);							
							ProjectCreateDialogService.show();
						}).error(function(data, status, headers, cfg) {
						});
					}

				};

				$scope.closeProjectDialog = function() {
					$scope.projectNew = {};
					ProjectCreateDialogService.hide();
				};

				$scope.remove = function(projectId) {
					bootbox.confirm("Do you want to delete this project", function(result) {
						if (result) {
							$http({
								method : 'DELETE',
								url : RestService.getUrl('projects/' + projectId + '.json'),
								headers : RestService.getHeaders(),
								data : {
									project : $scope.projectNew
								}
							}).success(function(data, status, headers, cfg) {
								$scope.loadProjects();
							}).error(function(data, status, headers, cfg) {
							});
						}
					});
				};

				$scope.triggerStar = function(project) {
					project.starred = !project.starred;
					var operator = (project.starred) ? "star.json" : "unstar.json";

					$http({
						method : 'PUT',
						url : RestService.getUrl('projects/' + project.id + '/' + operator),
						headers : RestService.getHeaders(),
					}).success(function(data, status, headers, cfg) {
					}).error(function(data, status, headers, cfg) {
					});
				};

				$scope.open = function(projectId) {
					ViewService.setCurrentView("project/"+projectId);
				};

			} ]);

	module.service('ProjectCreateDialogService', function() {
		var self = this;
		this.show = function() {
			$('#projectCreateModal').modal('show');
		};
		this.hide = function() {
			$('#projectCreateModal').modal('hide');
		};
	});

	module.directive('projectCreateDialog', [ 'ViewService', 'ProjectCreateDialogService', function(ViewService, ProjectCreateDialogService) {
		return {
			restrict : 'E',
			templateUrl : "templates/project-create-dialog.html"
		};

	} ]);

})();