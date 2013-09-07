angular.module('host', [])
	.controller('hostCtrl', function($scope, $window, $http) {
		$scope.hosts = $window.hosts;
		$scope.create = function() {
			if(!$scope.name ||!/^\w+$/.test($scope.name)){
                $scope.nameError = true;
                return;
			}else{
				$scope.nameError = false;
			}
			if(!$scope.host){
                $scope.hostError = true;
                return;
			}else{
				$scope.hostError = false;
			}
			$http.post('/hosts/add', {
				name: $scope.name,
				host: $scope.host
			})
				.success(function(data) {
					location.reload();
				});
		};
		$scope.remove = function(name) {
			$http.post('/hosts/delete', {
				name: name
			})
				.success(function(data) {
					location.reload();
				});
		};
	});