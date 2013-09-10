function hostStatusCtrl($scope, $routeParams, $http) {
	$http.get('/' + $routeParams.host + '/stats').success(function(data) {
		$scope.result = JSON.stringify(data, null, 4);
		$scope.host = $routeParams.host;
	});
}

function hostDbsCtrl($scope, $http) {
	var url = '/dbs';
	if (location.pathname.length > 1) {
		url = url + '?host=' + location.pathname.substr(1);
	}
	var hashs = location.hash.split("/");
	if(hashs.length>=3){
		$scope.database = hashs[2];
	}
	$http.get(url).success(function(data) {
		$scope.result = data;
	});
	$scope.selectDbs = function(dbs) {
		$scope.database = dbs;
	}
}

function dbsCtrl($scope, $routeParams, $http) {
	$http.get('/' + $routeParams.host + '/' + $routeParams.database).success(function(data) {
		data.status = JSON.stringify(data.status, null, 4);
		$scope.collectionNames = data.collectionNames;
		$scope.status = data.status;
		$scope.host = $routeParams.host;
		$scope.database = $routeParams.database;
	});
}

function collCtrl($scope, $routeParams, $http) {
	if(location.hash&&location.hash.indexOf('=')>0){
		$scope.query = location.hash.substr(location.hash.indexOf('=')+1);
	}
	$scope.q = "{\n\n}";
	$http.get('/' + $routeParams.host + '/' + $routeParams.database + '/' + $routeParams.collection)
	   .success(function(data) {
	   	if(data.err_msg){
	   		console.log(data.err_msg);
	   		$scope.notice = data.err_msg;
	   		return;
	   	}
		for(var i=0;i<data.list.length;i++){
			data.list[i] = decode(JSON.stringify(data.list[i], null, 4));
		}
		$scope.result = data;
		$scope.host = $routeParams.host;
		$scope.database = $routeParams.database;
		$scope.collection = $routeParams.collection;
	});

	$scope.toPage = function(offset, count, q,isclick) {
		
		if(isclick){
			$scope.notice = '';
		}

		if (offset < 0) {
			return;
		}
		if (offset >= count) {
			return;
		}
		$http.get('/' + $scope.host + '/' + $scope.database + '/' + $scope.collection+
			'?offset='+offset+'&q='+encodeURIComponent(q))
			.success(function(data) {
				if(data.err_msg){
			   		console.log(data.err_msg);
			   		$scope.notice = data.err_msg;
			   		return;
			   	}
				$scope.result = data;
			});
	};
	$scope.toremove = function(remove){
		$scope.remove = remove;
	};
	$scope.doremove = function(q){
		$http.post('/' + $scope.host + '/' + $scope.database + '/' + $scope.collection+'/remove',{q:q})
			.success(function(data) {
				if(data.count){
					$scope.notice = '删除记录'+data.count+'条';
				}
				$scope.remove = false;
				$scope.toPage(0,10,q);
			});
	};
	$scope.toinsert = function(insert){
		$scope.insert = insert;
		$scope.data = "{\n\n}";
	};
	$scope.doinsert = function(){
		JSON.parse($scope.data.replace(/[\n\t]/g,''));
		$http.post('/' + $scope.host + '/' + $scope.database + '/' + $scope.collection+'/insert',{data:$scope.data})
			.success(function(data) {				
				$scope.insert = false;
				$scope.notice = '新增成功';
				$scope.toPage(0,10,$scope.q);
			});
	};
}

function decode(s) {
	return unescape(s.replace(/\\(u[0-9a-fA-F]{4})/gm, '%$1'));
}