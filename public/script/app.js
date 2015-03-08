var app = angular.module('StarterApp', ['ngMaterial']);

app.factory('Music', function($http){
  var MUSIC_API = 'https://jop-culture.herokuapp.com/music/';
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
app.directive('jcItem', function(){
  return{
    restrict: 'E',
    transclude: true,
    scope: {
      item: '=data'
    },
    templateUrl: 'jc-item.html',
    controller: function($scope){
      console.log($scope.album);
    }
  };
});

app.controller('AppCtrl', ['$scope', 'Music', function($scope, Music){

  $scope.albums = [];

  Music.saved().then(function(response){
    $scope.albums = response.data.albums;
  });

}]);