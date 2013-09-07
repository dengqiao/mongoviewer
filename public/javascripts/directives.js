var myModule = angular.module('app');
//<div jsonview s="dbsquery"></div>
myModule.directive('jsonview', function factory() {
    var directiveDefinitionObject = {
        link: function postLink(scope, iElement, iAttrs) {
            scope.$watch(iAttrs.s, function(value) {
                iElement.html(value);
            });
        }
    };
    return directiveDefinitionObject;
});

myModule.directive('hello', function() {
    return {
        template: '<div>Hi there <span ng-transclude></span></div>',
        transclude: true
    };
});