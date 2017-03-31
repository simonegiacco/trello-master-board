(function() {
	var module = angular.module('tasklists', [ 'rest', 'view' ]);

	module.controller('TasklistsCtrl', [ '$scope', 'ViewService', 'RestService', '$http', '$routeParams', 'TaskDialogService', '$location', '$route',
			function($scope, ViewService, RestService, $http, $routeParams, TaskDialogService, $location, $route) {

				$scope.projectId = $routeParams.projectId;
				$scope.forceOpenTaskId = $routeParams.taskId;

				$scope.tasklists = [];
				$scope.listNew = {};

				$scope.loadProject = function() {
					$scope.newListName = '';
					$scope.newTaskName = [];
					$scope.newTaskList = -1;
					$scope.editList = -1;

					console.log($scope.tasklists);

					$http({
						method : 'GET',
						url : RestService.getUrl('projects/' + $scope.projectId + '.json'),
						headers : RestService.getHeaders(),
						data : {}
					}).success(function(data, status, headers, cfg) {
						$scope.project = data.project;
					}).error(function(data, status, headers, cfg) {
					});
				};

				$scope.loadLists = function() {
					$scope.loading = true;
					$http({
						method : 'GET',
						url : RestService.getUrl('projects/' + $scope.projectId + '/todo_lists.json?status=all&getSubTasks=yes'),
						headers : RestService.getHeaders(),
						data : {
							getSubTasks : 'yes',
							nestSubTasks : 'yes'
						}
					}).success(function(data, status, headers, cfg) {
						$scope.tasklists = data["todo-lists"];
						$scope.loading = false;

						for (var listIndex = 0; listIndex < $scope.tasklists.length; listIndex++) {
							var tasks = $scope.tasklists[listIndex]['todo-items'];
							for (var taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
								var task = tasks[taskIndex];
								task.dateHandler = TaskDialogService.handleDate(task['due-date']);
								if ($scope.forceOpenTaskId != null) {
									if (task.id == $scope.forceOpenTaskId) {
										TaskDialogService.show($scope, task, listIndex);
									}
								}
							}
						}

					}).error(function(data, status, headers, cfg) {
						$scope.loading = false;
					});
				};

				$scope.loadProject();
				$scope.loadLists();

				$scope.showNewList = function() {
					$scope.newListShown = true;
					$scope.editList = -1;
				};

				$scope.hideNewList = function(force) {
					if (force || $scope.newListName == '') {
						$scope.newListShown = false;
						$scope.newListName = '';
						$scope.editList = -1;
					}
				};

				$scope.saveNewList = function() {
					$http({
						method : 'POST',
						url : RestService.getUrl('projects/' + $scope.projectId + '/todo_lists.json'),
						headers : RestService.getHeaders(),
						data : {
							'todo-list' : {
								name : $scope.newListName
							}
						}
					}).success(function(data, status, headers, cfg) {
						$scope.loadLists();
						$scope.hideNewList(false);
						$scope.newListName = '';
					}).error(function(data, status, headers, cfg) {
					});
				};

				$scope.updateList = function(taskList) {
					$http({
						method : 'PUT',
						url : RestService.getUrl('todo_lists/' + taskList.id + '.json'),
						headers : RestService.getHeaders(),
						data : {
							'todo-list' : taskList
						}
					}).success(function(data, status, headers, cfg) {
						$scope.loadLists();
						$scope.loading = false;
						$scope.closeEdit();
					}).error(function(data, status, headers, cfg) {
					});
				};

				$scope.remove = function(taskList) {
					bootbox.confirm("Do you want to delete list <strong>" + taskList.name + "</strong>?", function(result) {
						if (result) {
							$http({
								method : 'DELETE',
								url : RestService.getUrl('todo_lists/' + taskList.id + '.json'),
								headers : RestService.getHeaders(),
								data : {}
							}).success(function(data, status, headers, cfg) {
								$scope.loadLists();
							}).error(function(data, status, headers, cfg) {
							});
						}
					});
				};

				$scope.isEditShown = function(index) {
					return $scope.editList == index;
				}

				$scope.openEdit = function(index) {
					$scope.editList = index;
				};
				$scope.closeEdit = function() {
					$scope.editList = -1;
				};

				$scope.addTask = function(taskList, listIndex) {
					$scope.addingTask = true;
					$http({
						method : 'POST',
						url : RestService.getUrl('tasklists/' + taskList.id + '/tasks.json'),
						headers : RestService.getHeaders(),
						data : {
							"todo-item" : {
								"content" : $scope.newTaskName[listIndex]
							}
						}
					}).success(function(data, status, headers, cfg) {
						$scope.loadSingleList(taskList.id, listIndex, function() {
							$scope.closeNewTaskDialog(false, listIndex);
							$scope.newTaskName[listIndex] = '';
						});
						$scope.addingTask = false;
					}).error(function(data, status, headers, cfg) {
						$scope.addingTask = false;
					});
				};


				$scope.removeTask = function(task, listIndex) {
					bootbox.confirm("Do you want to delete task <strong>" + task.content + "</strong>?", function(result) {
						if (result) {
							$scope.removingTaskId = task.id;
							$http({
								method : 'DELETE',
								url : RestService.getUrl('tasks/' + task.id + '.json'),
								headers : RestService.getHeaders(),
								data : {}
							}).success(function(data, status, headers, cfg) {
								$scope.loadSingleList(task['todo-list-id'], listIndex, function() {
									$scope.removingTaskId = -1;
								});
							}).error(function(data, status, headers, cfg) {
								$scope.removingTaskId = -1;
							});
						}
					});
				};

				$scope.showNewTaskDialog = function(index) {
					$scope.newTaskList = index;
				};

				$scope.closeNewTaskDialog = function(force, listIndex) {
					if (force || $scope.newTaskName[listIndex] == '') {
						$scope.newTaskList = -1;
						$scope.newTaskName[listIndex] = '';
						$scope.addingTask = false;
					}
				};

				$scope.loadSingleList = function(listId, listIndex, success) {
					$http({
						method : 'GET',
						url : RestService.getUrl('todo_lists/' + listId + '.json?status=all'),
						headers : RestService.getHeaders(),
						data : {}
					}).success(function(data, status, headers, cfg) {
						
						var tasks = data["todo-list"]['todo-items'];
						for (var taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
							var task = tasks[taskIndex];
							task.dateHandler = TaskDialogService.handleDate(task['due-date']);
						}
						$scope.tasklists[listIndex] = data["todo-list"];
						
						success();
					}).error(function(data, status, headers, cfg) {
					});
				};

				$scope.showTaskDialog = function(task, listIndex) {
					// set taskId to prevent route reloading
					$route.current.pathParams['taskId'] = task.id;
					$location.path('/project/' + $route.current.pathParams['projectId'] + '/' + task.id);
					TaskDialogService.show($scope, task, listIndex);
				};

			} ]);

})();