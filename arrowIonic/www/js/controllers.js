angular.module('starter.controllers', [])

.controller('MapCtrl', function($rootScope, $scope, $state, $cordovaGeolocation) {
  // do we actually need $state here?
  var options = {timeout: 10000, enableHighAccuracy: true};

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    var contentString = '<div id="content">'+

          '<div id="bodyContent">'+
          '<a href="#/tab/account"> CLICK HERE </a>'+
          '</div>'+
          '</div>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });

    google.maps.event.addDomListener($scope.map, 'mousedown', function(e){
      $rootScope.mousePosition = e.latLng;
    });

    $scope.onHold = function() {
      var marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: $rootScope.mousePosition
      });
      marker.addListener('click', function() {
        infowindow.open($scope.map, marker);
      });

    };


  }, function(error){
    console.log("Could not get location");
  });

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
})
.controller('AccountCtrl', function($rootScope, $scope) {
  $scope.settings = {
    enableFriends: true
  };
});
