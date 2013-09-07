angular.module('app', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/:host', {templateUrl: '/html/host.html', controller: hostStatusCtrl})
    .when('/:host/:database', {templateUrl: '/html/database.html',   controller: dbsCtrl})
    .when('/:host/:database/:collection', {templateUrl: '/html/collection.html',   controller: collCtrl});
}]);