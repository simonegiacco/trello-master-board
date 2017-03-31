(function() {
	var module = angular.module('controls', []);

	module.directive('collapsePanel', function() {
		return {
			restrict : 'E',
			replace : true,
			transclude : true,
			templateUrl : "templates/controls/collapse-panel.html",
			scope : {
				collapsedAttr : "=collapsed",
				accordionId : "@accordionId"
			},

			link : function(scope, element, attrs) {
				var detailPanel = $(element).find("[panel-item='details']")[0];
				var switcher = $(element).find("[panel-item='header']")[0];
				$(switcher).click(function() {
					// close others
					$(element).siblings().children("[panel-item='details']:visible").slideUp(100);

					if ($(detailPanel).is(":hidden")) {
						$(detailPanel).slideToggle(100);
						$(element).attr("collapsed", false);
						scope.collapsedAttr = false;
						scope.state = true;
					}
				});
			}
		};
	});

	module.directive('datepicker', function() {
		return {
			restrict : 'A',
			require : 'ngModel',
			link : function(scope, element, attrs, ngModelCtrl) {
				$(function() {
					element.datepicker({
						dateFormat : 'dd.mm.yy',
						onSelect : function(date) {
							scope.$apply(function() {
								ngModelCtrl.$setViewValue(date);
							});
						}
					});
				});
			}
		};
	});

	module.directive('submitByEnter', function() {
		return {
			restrict : 'A',
			link : function(scope, element, attrs) {
				element.bind("keydown keypress", function(event) {					
					if (event.which === 13 && !event.shiftKey && !event.altKey && !event.ctrlKey) {
						scope.$apply(function() {
							scope.$eval(attrs.submitByEnter);
						});
						event.preventDefault();
					}
				});
			},

		};
	});
	
	
	module.directive('sortable', ['RestService', '$http', function(RestService, $http) {
		return {
			restrict : 'A',
			link : function(scope, element, attrs) {
				$( element ).sortable({
					axis: "y",
					helper: 'clone',
					revert: true,
					update: function(event, ui){
						var taskId = $(ui.item).attr('task-id');
						var taskPreviousId = $(ui.item).prev().attr('task-id')
						var listIndex = $(ui.item).attr('list-index');	
						console.log(scope);
						if(typeof(taskPreviousId)=="undefined"){
							taskPreviousId =-1;
						}
						$http({
							method : 'PUT',
							url : RestService.getUrl('tasks/' + taskId + '.json'),
							headers : RestService.getHeaders(),
							data : {'todo-item':{positionAfterTask: taskPreviousId}}
						}).success(function(data, status, headers, cfg) {
				
						}).error(function(data, status, headers, cfg) {
							
						});
					}
				});
				$( element ).disableSelection();				
			},
		};
	}]);

	module.directive('selectPicker', [ '$timeout', function($timeout) {
		return {
			restrict : 'A',
			replace : true,
			require : 'ngModel',
			link : function(scope, element, attrs, ngModel) {
				// http://silviomoreto.github.io/bootstrap-select/
				// http://suhairhassan.com/2013/05/01/getting-started-with-angularjs-directive.html#.VPzJYfmsV1B
				$timeout(function() {
					$(element).selectpicker();
				});
				scope.$watch(function() {
					return ngModel.$modelValue;
				}, function(modelValue) {
					$(element).selectpicker('val', modelValue);
				});
			}
		};
	} ]);

})();