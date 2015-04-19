var app = angular.module('StarterApp', ['ngMaterial']);

app.factory('Music', function($http){
  var MUSIC_API = 'https://jop-culture.herokuapp.com/music/';
  //var MUSIC_API = 'http://localhost:3666/music/';
  return {
    saved: function(){
      return $http.get(MUSIC_API+ 'saved');
    }
  }
});

app.directive('myCustomer', function() {
  return {
    template: 'Name: {{customer.name}} Address: {{customer.address}}'
  };
});

/**
 An item element. Could be an album or a movie etc..
*/
app.directive('jcGrid', function(){
  return{
    restrict: 'E',
    transclude: true,
    scope: {
      items: '=items'
    },
    templateUrl: 'jc-grid.html',
  };
});

app.controller('AppCtrl', ['$scope', 'Music', function($scope, Music){

  $scope.items = [];

  Music.saved().then(function(response){
    $scope.items = response.data.albums;
  });
}]);