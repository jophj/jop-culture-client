var app = angular.module('StarterApp', ['ngMaterial']);
/**
  Section names are:
    music
    movies
    books
  YOLO, no tiem for constants
*/
app.factory('Music', function($http){
  var MUSIC_API = 'https://jop-culture.herokuapp.com/music/';
  //var MUSIC_API = 'http://localhost:3666/music/';
  return {
    saved: function(offset, limit){
      return $http.get(MUSIC_API+ 'saved', {params: {"limit": limit, "offset": offset}});
    }
  }
});

app.factory('DataProvider', function(Music){

  /* Here's the configurations of data providers */
  providers = {
    "music": {
      "saved": Music.saved
    }
  }

  selector = function(source){
    return providers[source];
  }
  return selector;
});

app.controller('AppCtrl', [
  '$scope', 'Music', '$window',
  function($scope, Music, $window){
    
    $scope.section = 'music';

    hash = $window.location.hash;

    var regexp = /^#\/([^\/]+)\/?.*$/;
    var match = regexp.exec(hash);

    if (match != null && match[1] != null){
      $scope.section = match[1];
    }
  }
]);

app.controller('gridCtrl', [
  '$scope', 'DataProvider', '$window',
  function($scope, DataProvider, $window){

    var limit = 50;      //loads no more than limit items every call
    var offset = 0;
    $scope.items = [];

    DataProvider($scope.section).saved(0, limit).then(function(response){
      $scope.items = response.data.albums;
      offset = response.data.offset;
    });

    //TODO the watcher for $scope.section that loads data
  }
]);

app.directive('scrollLoad', function(){
  return{
    restrict: 'A',
    link: function(scope, element, attrs){
      element.bind('scroll', function(){
        console.log('h4x0rz');
      });
    }
  }
});