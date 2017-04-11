(function() {
	var module = angular.module('task', []);

	module.service('TaskDialogService', [ '$http', 'RestService', '$location', '$route', function($http, RestService, $location, $route) {
		var self = this;

		this.calculateProgress = function(subTasks, $scope){
			if(subTasks==null || subTasks==""){
				return;
			}
			var completed = 0;
			var total = subTasks.length;
			for (var i = 0; i < subTasks.length; i++) {
				if(subTasks[i].state){
					completed ++;
				}
			}
			if(total>0){
				$scope.dialogTask.progress = (completed/total)*100;
			}
		};
		
		this.getFormattedDate = function(rawDate) {
			if (rawDate == null || rawDate == '') {
				return '';
			}
			var dd = rawDate.substring(6,8);
			var mm = rawDate.substring(4,6);
			var yyyy = rawDate.substring(0,4);
			return yyyy + '.' + mm + '.' + dd;
		};
		
		this.handleDate = function(strDate){
			console.log(strDate);
			if(strDate==null || strDate==""){
				return '';
			}
			if(strDate.length<10){
				strDate = this.getFormattedDate(strDate);
			}
			var dd = parseInt(strDate.substring(0,2));
			var mm = parseInt(strDate.substring(3,5));
			var yyyy = parseInt(strDate.substring(6,10));
			mm=mm-1;
			var dueDate = new Date(yyyy, mm, dd);
			var today = new Date();
			today.setHours(0,0,0,0);
			var tomorrow = new Date ();
			tomorrow.setHours(0,0,0,0);
			tomorrow.setDate(tomorrow.getDate()+1);
			
			var weekend = new Date();
			weekend.setHours(0,0,0,0);
			weekend.setDate(weekend.getDate()+7);

			
			console.log(dueDate +'  tomorrow:'+tomorrow);
			if(dueDate.getTime()==today.getTime()){
				return "task-dark-orange";
			}
			if(dueDate.getTime()==tomorrow.getTime()){
				return "task-orange";
			}

			if(dueDate.getTime()> today.getTime() && dueDate.getTime()< weekend.getTime()){
				return "task-light-orange";
			}
						
			if(dueDate.getTime()<today.getTime()){
				return "task-red";
			}
			
			
		}
		
		
		this.loadTask = function(taskId, success) {
			$http({
				method : 'GET',
				url : RestService.getUrl('tasks/' + taskId + '.json?nestSubTasks=yes&includeCompletedSubtasks=yes'),
				headers : RestService.getHeaders(),
				data : {}
			}).success(function(data, status, headers, cfg) {
				var subtasks = data['todo-item'].subTasks;
				if (subtasks != null && subtasks != '') {
					for (var i = 0; i < subtasks.length; i++) {
						if (subtasks[i].status == "completed") {
							subtasks[i].state = true;
						} else {
							subtasks[i].state = false;
						}
					}
				}
				success(data);
			}).error(function(data, status, headers, cfg) {
			});
		};
		

		this.show = function($scope, task, listIndex) {
			$scope.dialogTask = {};
			this.scope = $scope;
			this.listIndex = listIndex;
			var calculator = this.calculateProgress;
			var formatter = this.getFormattedDate;
			var dateHandler = this.handleDate;
			this.loadTask(task.id, function(data) {
				$scope.dialogTask = data['todo-item'];
				calculator($scope.dialogTask.subTasks, $scope);				
				$scope.dialogTask['due-date'] = formatter($scope.dialogTask['due-date']);
				$scope.dialogTask.dateHandler=dateHandler($scope.dialogTask['due-date']);
				$('#taskModal').modal('show');
			});			
		};
		
		this.refreshList = function(){
			this.scope.loadSingleList(this.scope.dialogTask['todo-list-id'], this.listIndex, function(){});
		}
		
		this.hide = function() {
		    delete $route.current.pathParams ['taskId'];
		    $location.path('/project/'+$route.current.pathParams ['projectId']);
			 this.refreshList();
			$('#taskModal').modal('hide');
		};
	} ]);

	module.directive('taskDialog', [ 'TaskDialogService', '$http', 'RestService', function(TaskDialogService, $http, RestService) {
		return {
			restrict : 'E',
			templateUrl : "templates/task-dialog.html",
			controller : function($scope) {

				$scope.isEditCaption = false;
				$scope.isEditDescription = false;
				$scope.subEditId = -1;
				$scope.isAddSub = false;
				$scope.subCaption = '';

				$scope.hide = function() {
					TaskDialogService.hide();					
				};
				
				$scope.editCaption = function() {
					$scope.isEditCaption = true;
				};

				$scope.editDescription = function() {
					$scope.isEditDescription = true;
				};

				$scope.openAddSub = function() {
					$scope.subCaption = '';
					$scope.isAddSub = true;
				};

				$scope.closeEditCaption = function() {
					$scope.isEditCaption = false;
				};

				$scope.closeEditDescription = function() {
					$scope.isEditDescription = false;
				};

				$scope.closeAddSub = function(force) {
					if(force || $scope.subCaption==''){
						$scope.subCaption = '';
						$scope.isAddSub = false;
					}
				};
				
				$scope.checkChanged = function(check) {
					var operation = check.state ? "/complete.json" : "/uncomplete.json";
					$http({
						method : 'PUT',
						url : RestService.getUrl('tasks/' + check.id + operation),
						headers : RestService.getHeaders(),
						data : {}
					}).success(function(data, status, headers, cfg) {
						TaskDialogService.calculateProgress($scope.dialogTask.subTasks, $scope);
						console.log("check changed="+$scope.dialogTask.progress);
					}).error(function(data, status, headers, cfg) {
					});
				}

				$scope.saveCaption = function(task) {
					data = {
						'todo-item' : {
							content : task.content
						}
					};
					$scope.updateTask(task.id, data, function() {
						$scope.isEditCaption = false;
					})
				};
				
				$scope.saveDueDate = function(task) {
					var strDate = task['due-date'];
					var formattedDate = '';
					if(strDate != null && strDate!=""){					
						var dd = strDate.substring(0,2);
						var mm = strDate.substring(3,5);
						var yyyy = strDate.substring(6,10);
						formattedDate = yyyy+mm+dd;
					}
					data = {
						'todo-item' : {
							'due-date' : formattedDate
						}
					};
					$scope.updateTask(task.id, data, function() {});
				};

				$scope.saveDescription = function(task) {
					data = {
						'todo-item' : {
							description : task.description
						}
					};
					$scope.updateTask(task.id, data, function() {
						$scope.isEditDescription = false;
					})
				};

				$scope.addSub = function(task) {
					$scope.addingSubTask = true;
					$http({
						method : 'POST',
						url : RestService.getUrl('tasklists/' + task['todo-list-id'] + '/tasks.json'),
						headers : RestService.getHeaders(),
						data : {
							"todo-item" : {
								"content" : $scope.subCaption,
								"parentTaskId" : task.id
							}
						}
					}).success(function(data, status, headers, cfg) {
						TaskDialogService.loadTask(task.id, function(data) {
							$scope.dialogTask = data['todo-item'];
							$scope.closeAddSub(false);
							$scope.subCaption = '';
							$scope.addingSubTask = false;
							$scope.subEditId = -1;
						});
					}).error(function(data, status, headers, cfg) {
						$scope.addingSubTask = false;
					});
				};

				$scope.updateTask = function(id, data, success) {
					$http({
						method : 'PUT',
						url : RestService.getUrl('tasks/' + id + '.json'),
						headers : RestService.getHeaders(),
						data : data
					}).success(function(data, status, headers, cfg) {
						success();
					}).error(function(data, status, headers, cfg) {
					});
				};
				
				$scope.removeCheck = function(index, check){
					bootbox.confirm("Do you want to delete check <strong>" + check.content + "</strong>?", function(result) {
						if (result) {
							$scope.removingCheckId = check.id;
							$http({
								method : 'DELETE',
								url : RestService.getUrl('tasks/' + check.id + '.json'),
								headers : RestService.getHeaders(),
								data : {}
							}).success(function(data, status, headers, cfg) {
								TaskDialogService.loadTask(check.parentTaskId, function(data) {
									$scope.dialogTask = data['todo-item'];
									$scope.removingCheckId = -1;
									TaskDialogService.calculateProgress($scope.dialogTask.subTasks, $scope);
								});
																
								
							}).error(function(data, status, headers, cfg) {
								$scope.removingCheckId = -1;
							});
						}
					});	
				};
				
				$scope.editCheck = function(index, check){
					$scope.subEditId = index;
				};

				$scope.closeCheckEdit = function(){
					$scope.subEditId = -1;
				};
				
				$scope.updateCheck = function(task) {
					data = {'todo-item' : {content : task.content}};
					$scope.updateTask(task.id, data, function() {
						$scope.subEditId = -1;
					})
				};
				
				$scope.taskCompleteChanged = function(){
					if($scope.dialogTask==null){
						return;
					}					
					var operand = $scope.dialogTask.completed?"complete.json":"uncomplete.json" 
					$http({
						method : 'PUT',
						url : RestService.getUrl('tasks/' + $scope.dialogTask.id + '/'+operand),
						headers : RestService.getHeaders()
					}).success(function(data, status, headers, cfg) {
						TaskDialogService.refreshList();		
					}).error(function(data, status, headers, cfg) {
					});
				};
				
				$scope.getTaskUrl = function(){
					if($scope.dialogTask==null){
						return "";
					}
					return RestService.getUrl('tasks/' + $scope.dialogTask.id);
				};
				
			},
			controllerAs : 'TaskDialogCtrl'
		};

	} ]);

})();