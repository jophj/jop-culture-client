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
app.factory('Movies', function($http){
  var MUSIC_API = 'https://jop-culture.herokuapp.com/music/';
  //var MUSIC_API = 'http://localhost:3666/music/';
  return {
    saved: function(offset, limit){
      return $http.get(MUSIC_API+ 'saved', {params: {"limit": limit, "offset": offset}});
    }
  }
});

app.factory('DataProvider', ['Music', 'Movies', function(Music, Movies){

  /* Here's the configurations of data providers */
  providers = {
    "music": {
      "saved": Music.saved
    },
    "movies": {
      "saved": Movies.saved
    }
  }

  selector = function(source){
    return providers[source];
  }
  return selector;
}]);


app.factory('DataService', ['DataProvider', function(DataProvider){

  var LIMIT = 15;   // number of items retrieved (if any)
  var Loader = function(section){
    this.section = section;

    //TODO BUG backend. Loading from offset i build first album even if is already build
    // at offset i-1 thus, duplicating album.
    this.loadMore = function(){
      var dataService = dataServices[section];

      var offset = dataService.offset;
      var oldOffset = dataService.oldOffset;

      if (oldOffset < offset){
        dataService.isLoading = true;
        DataProvider(section).saved(offset, LIMIT).then(

          function(response){
            for (var i = 0; i < response.data.items.length; i++) {
              dataService.cachedData.push(response.data.items[i]);
            };
            dataService.oldOffset = offset;
            dataService.offset = response.data.offset;
            dataService.isLoading = false;
        },
          function(error){
            dataService.isLoading = false;
            console.log(error);
          });
      }
    }
  }

  var dataServices = {
    "music": {
      cachedData: [],
      offset: 0,
      oldOffset: -1,
      isLoading: false,
      loadMore: new Loader('music').loadMore
    },
    "movies": {
      cachedData: [],
      offset: 0,
      oldOffset: -1,
      isLoading: false,
      loadMore: new Loader('movies').loadMore
    }
  }

  selector = function(source){
    return dataServices[source];
  }
  return selector;
}]);


app.controller('AppCtrl', [
  '$scope', 'Music', '$window',
  function($scope, Music, $window){

    var buildSelectedClass = function(){
      return {
        "music": {
          "selected":  $scope.section == 'music'
        },
        "movies": {
          "selected": $scope.section == 'movies'
        }
      }
    }

    $scope.sectionClicked = function (section) {
      $window.location.hash = '/'+section;
      $scope.section = section;
      $scope.selectedClass = buildSelectedClass();
    }
    
    hash = $window.location.hash;

    var regexp = /^#\/([^\/]+)\/?.*$/;
    var match = regexp.exec(hash);

    if (match != null && match[1] != null){
      $scope.section = match[1];
    }
    else{
      $scope.section = 'music';
    }

    $scope.selectedClass = buildSelectedClass();
  }
]);


app.controller('gridCtrl', [
  '$scope','DataService',
  function($scope, DataService){

    // Number of elements in the page. Page must be initialized with at least
    // pageSize items (until scroll bar is visible) because data loading only
    // happen when scrollbar reaches bottom
    var pageSize = 15; 
    $scope.loading = false;

    $scope.loadMore = function(){
      DataService($scope.section).loadMore();
    }

    $scope.$watch('section', function(newValue, oldValue){
      $scope.items = DataService(newValue).cachedData;
      $scope.loading = DataService(newValue).isLoading;

      if ($scope.items.length < pageSize){
        $scope.loadMore();
      }
    });

    //TODO the watcher for $scope.section that loads data
  }
]);


app.directive('scrollLoad', function($timeout){
  return{

    restrict: 'A',
    scope: {
      onScrollEnd: '='
    },

    link: function(scope, element, attrs){
      element.bind('scroll', function(evt){
        var scroll = element[0].scrollTop + element[0].parentElement.scrollHeight;
        var scrollRelative = scroll - element[0].scrollHeight;
        if (Math.abs(scrollRelative) <= 1){
          scope.onScrollEnd();
        }
      });
    }
  }
});