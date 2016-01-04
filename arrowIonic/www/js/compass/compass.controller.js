angular.module('app')
.controller('CompassCtrl', function($rootScope, $scope, $state, $cordovaDeviceOrientation, $cordovaGeolocation, $ionicScrollDelegate) {


  document.addEventListener("deviceready", function () {
    $scope.here;
    $scope.there;
    $scope.bearing;
    $scope.rotation;
    $scope.distance;
    $scope.heading;
    $scope.compass;


    // see http://ngcordova.com/docs/plugins/geolocation
    var locationOptions = {
      timeout: 3000,
      maximumAge: 10000,
      enableHighAccuracy: false // may cause errors if true
    };

    $cordovaGeolocation.watchPosition(locationOptions)
      .then(
      null,
      function(err) {
        console.log(err);
      },
      function(position) {
        $scope.here = turf.point([position.coords.latitude, position.coords.longitude]);
        $scope.there = turf.point([$rootScope.markerPosition["J"], $rootScope.markerPosition["M"]]);
        $scope.bearing = Math.floor(turf.bearing($scope.here, $scope.there) - $scope.heading + 90);
        $scope.rotation = 'transform: rotate('+ $scope.bearing +'deg)';
        $scope.distance = Number(turf.distance($scope.here, $scope.there, 'miles')).toFixed(2);
    });


    // see http://ngcordova.com/docs/plugins/deviceOrientation
    var orientationOptions = { frequency: 100 };   // how often the watch updates

    $scope.watch = $cordovaDeviceOrientation.watchHeading(orientationOptions).then(
      null,
      function(error) {
        $scope.heading = err;
      },
      function(result) {
        $scope.compass = 'transform: rotate(-'+ result.magneticHeading +'deg)';
        $scope.heading = result.magneticHeading;
        //  try result.magneticHeading?
      });

    }, false);
});