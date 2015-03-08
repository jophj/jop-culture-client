var app = angular.module('StarterApp', ['ngMaterial']);

app.factory('Music', function($http){
  var MUSIC_API = 'https://jop-culture.herokuapp.com/music/';
  return {
    saved: function(){
      return $http.get(MUSIC_API+ 'saved');
    }
  }
});

app.controller('AppCtrl', ['$scope', 'Music', function($scope, Music){

  $scope.albums = [];

  Music.saved().then(function(response){
    $scope.albums = response.data.albums;
    console.log($scope.albums);
  });

}]);