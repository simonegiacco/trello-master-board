(function() {
	var module = angular.module('rest', []);
	module.service('RestService', [ function() {
		
		this.company = "testtest999";
		this.key = "spain686india";

		this.getCompany = function(){
			return this.company;
		}		
		
		this.getUrl = function(operation){
			return 'https://' + this.company + '.teamwork.com/'+operation;
		}
		
		this.getHeaders = function() {
			var headers = {"Authorization": "BASIC " + window.btoa(this.key + ":xxx")};
			return headers;
		};
		

	} ]);
})();