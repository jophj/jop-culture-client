/* global angular */
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
  //MUSIC_API = 'http://localhost:3666/music/';
  return {
    saved: function(offset, limit){
      return $http.get(MUSIC_API+ 'saved', {params: {"limit": limit, "offset": offset}});
    }
  };
});
app.factory('Movies', function($http){
  var MUSIC_API = 'https://jop-culture.herokuapp.com/music/';
  //var MUSIC_API = 'http://localhost:3666/music/';
  return {
    saved: function(offset, limit){
      return $http.get(MUSIC_API+ 'saved', {params: {"limit": limit, "offset": offset}});
    }
  };
});

app.factory('DataProvider', ['Music', 'Movies', function(Music, Movies){

  /* Here's the configurations of data providers */
  var providers = {
    "music": {
      "saved": Music.saved
    },
    "movies": {
      "saved": Movies.saved
    }
  };

  var selector = function(source){
    return providers[source];
  };
  return selector;
}]);


app.factory('DataService', ['DataProvider', function(DataProvider){

  var LIMIT = 5;   // number of items retrieved (if any)
  var Loader = function(section){
    this.section = section;

    //TODO BUG backend. Loading from offset i build first album even if is already build
    // at offset i-1 thus, duplicating album.
    this.loadMore = function(callback){
      var dataService = dataServices[section];

      var offset = dataService.offset;
      var oldOffset = dataService.oldOffset;

      if (oldOffset < offset && !dataService.isLoading){
        dataService.isLoading = true;
        DataProvider(section).saved(offset, LIMIT).then(

          function(response){
            for (var i = 0; i < response.data.items.length; i++) {
              dataService.cachedData.push(response.data.items[i]);
            };
            dataService.oldOffset = offset;
            dataService.offset = response.data.offset;
            dataService.isLoading = false;
            
            if (callback)
              callback();
        },
          function(error){
            dataService.isLoading = false;
            if (callback)
              callback(error);
            //console.log(error);
          });
      }
      else{
        dataService.hasMoreData = false;
        dataService.isLoading = false;
        if(callback)
          callback();
      }
    };
  };

  var dataServices = {
    "music": {
      cachedData: [],
      name: 'Music',
      offset: 0,
      oldOffset: -1,
      isLoading: false,
      hasMoreData: true,
      loadMore: new Loader('music').loadMore
    },
    "movies": {
      cachedData: [],
      name: 'Movies',
      offset: 0,
      oldOffset: -1,
      isLoading: false,
      hasMoreData: true,
      loadMore: new Loader('movies').loadMore
    }
  };

  var selector = function(source){
    return dataServices[source];
  }
  return selector;
}]);


app.controller('AppCtrl', [
  '$scope', 'Music', '$window', '$mdMedia', '$mdSidenav',
  function($scope, Music, $window, $mdMedia, $mdSidenav){

    $scope.$watch(function(){
      return $mdMedia('gt-lg');
    }, function(){
      $scope.menuLockedOpen = $mdMedia('gt-lg');
      console.log($scope.menuLockedOpen);
    });

    $scope.toggleMenu = function(){
      $mdSidenav('left').toggle();
    }

    var buildSelectedClass = function(){
      return {
        "music": {
          "selected":  $scope.section == 'music'
        },
        "movies": {
          "selected": $scope.section == 'movies'
        }
      };
    };

    $scope.sectionClicked = function (section) {
      $window.location.hash = '/'+section;
      $scope.section = section;
      $scope.selectedClass = buildSelectedClass();
    };
    
    var hash = $window.location.hash;

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

// app.controller('sidenavCtrl', [
//   '$scope','$mdUtil','$mdSidenav',
//   function($scope, $mdUtil, $mdSidenav){
//     $scope.toggleLeft = buildToggler('left');

//     function buildToggler(navID) {
//       var debounceFn =  $mdUtil.debounce(function(){
//         $mdSidenav(navID)
//           .toggle()
//           .then(function () {
//           });
//       },300);
//       return debounceFn;
//     }
//   }
// ]);

app.controller('gridCtrl', [
  '$scope','$element', 'DataService',
  function($scope, $element, DataService){

    var containerElement = $element[0];
    var gridElement = $element[0].children[0];

    var isFull = function(){
      var margin = containerElement.scrollHeight - gridElement.scrollHeight;
      return margin < 0;
    }

    $scope.loading = false;

    $scope.loadMore = function(){
      if (!$scope.loading){
        $scope.loading = true;
        DataService($scope.section).loadMore(loadCallback);
      }
    };
    
    var loadCallback = function (error) {
      $scope.loading = false;
      if (!isFull() && DataService($scope.section).hasMoreData){
        $scope.loadMore();
      }

      if (!DataService($scope.section).hasMoreData){
        $scope.hasMoreData = false;
      }
    };

    $scope.$watch('searchString', function(newValue, oldValue){
      $scope.loadMore();
    });

    $scope.$watch('section', function(newValue, oldValue){
      $scope.items = DataService(newValue).cachedData;
      $scope.gridTitle = DataService(newValue).name;
      $scope.hasMoreData = true;

      $scope.loadMore();
    });
  }
]);


app.directive('imgFallback', function(){
  return{
    restrict: 'A',
    link: function(scope, element, attrs){
      element[0].src = './icons/ic_album_48px.svg';
    }
  };
});

app.directive('scrollLoad', function(){
  return{

    restrict: 'A',
    scope: {
      onScrollEnd: '='
    },

    link: function (scope, element, attrs){
      var gridElement = element[0];
      element.bind('scroll', function(evt){
        var scroll = element[0].scrollTop + element[0].parentElement.scrollHeight;
        var scrollRelative = scroll - element[0].scrollHeight;
        
        var bottomSpace = element[0].parentElement.scrollHeight - element[0].scrollHeight; 
        if (Math.abs(scrollRelative) <= 1 || bottomSpace > 40 ){
          scope.onScrollEnd();
        }
      });
    }
  };
});