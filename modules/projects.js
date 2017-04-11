(function() {
	var module = angular.module('projects', [ 'rest', 'view' ]);

	module.controller('ProjectsCtrl', [ '$scope', 'ViewService', 'RestService', '$http', '$filter', '$routeParams', 'ProjectCreateDialogService',
			function($scope, ViewService, RestService, $http, $filter, $routeParams, ProjectCreateDialogService) {
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
					}).success(function(data, status, headers, cfg) {	//modify 2017/4/8 Anton
						//console.log(data);
						var temp = data.projects;
						for (index in temp) {
							data.projects[index].startDate = getFormattedDate(temp[index].startDate);
							data.projects[index].endDate = getFormattedDate(temp[index].endDate);
						}
						$scope.projects = data.projects;
						$scope.loading = false;
					}).error(function(data, status, headers, cfg) {
						$scope.loading = false;
					});
				};

				// modify 2017/04/09 Anton
				var getFormattedDate = function(rawDate) {
					if (rawDate == null || rawDate == '') {
						return 'none';
					}
					var dd = rawDate.substring(6,8);
					var mm = rawDate.substring(4,6);
					var yyyy = rawDate.substring(0,4);
					return yyyy + '.' + mm + '.' + dd;
				};

				// modify 2017/04/09 Anton
				var parseDate = function(strDate){					
					if(strDate == null || strDate==""){
						return '';
					}
					var dd = strDate.substring(0,2);
					var mm = strDate.substring(3,5);
					var yyyy = strDate.substring(6,10);
					return yyyy+mm+dd;
				}

				$scope.saveProject = function(projectNew) {
					console.log(projectNew);
					var method = 'POST';
					var operator = 'projects.json';
					if ($scope.projectNew.id) {
						method = 'PUT';
						operator = 'projects/' + $scope.projectNew.id + '.json';
					}
					
					//$scope.projectNew.startDate = parseDate($scope.projectNew.startDate);					
					//$scope.projectNew.endDate = parseDate($scope.projectNew.endDate);
					//console.log($scope.projectNew.startDateF+';'+$scope.projectNew.endDateF)
					//console.log($scope.projectNew.startDate+';'+$scope.projectNew.endDate)
					$scope.projectNew["category-id"] = $scope.projectNew.categoryId;
					
					// convert date format - 2017/04/09 Anton
					$scope.projectNew["created-on"] = $filter('date')($scope.projectNew["created-on"], "yyyymmdd");
					$scope.projectNew["last-changed-on"] = $filter('date')($scope.projectNew["last-changed-on"], "yyyymmdd");
					//$scope.projectNew["startDate"] = "20150512";//$filter('date')(projectNew.startDate, "yyyymmdd");
					//$scope.projectNew["endDate"] = "20150512";//$filter('date')(projectNew.endDate, "yyyymmdd");
					//$scope.projectNew["startDateF"] = "20150512";//$filter('date')(projectNew.startDate, "yyyymmdd");
					//$scope.projectNew["endDateF"] = "20150512";//$filter('date')(projectNew.endDate, "yyyymmdd");
					//console.log($scope.projectNew["startDate"]);
					//console.log($scope.projectNew);
					$scope.postdata = {};
					$scope.postdata = $scope.projectNew;

					$http({
						method : method,
						url : RestService.getUrl(operator),
						headers : RestService.getHeaders(),
						data : {
							project : $scope.postdata
						}
					}).success(function(data, status, headers, cfg) {
						console.log(data);
						$scope.loadProjects();
						$scope.projectNew = {};
						ProjectCreateDialogService.hide();
					}).error(function(data, status, headers, cfg) {
						//console.log(data);
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
					//console.log($scope.selectedCompanyId);
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
							//$scope.projectNew.startDateF = $scope.getFormattedDate(data.project.startDate);
							//$scope.projectNew.endDateF = $scope.getFormattedDate(data.project.endDate);							
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