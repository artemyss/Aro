angular.module('starter.controllers', [])

.controller('MapCtrl', function($rootScope, $scope, $cordovaGeolocation) {
  var initialize = function() {
    var initializeMap = function() {
      var mapOptions = {
        center: $rootScope.currentPosition,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
      };

      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

      google.maps.event.addDomListener($scope.map, 'mousedown', function(e){
        $scope.mousePosition = e.latLng;
        if (document.getElementById('deleteMarkerButton').style.display === 'block') {
          document.getElementById('setArrowButton').style.display = 'none';
          document.getElementById('deleteMarkerButton').style.display = 'none';
          document.getElementById('currentLocButton').style.display = 'block';
        }
        infowindow.close();
      });
    };

    var watchOptions = {
      timeout: 10000,
      enableHighAccuracy: true
    };

    // Get user's current geolocation
    $cordovaGeolocation.getCurrentPosition(watchOptions)
      .then(function(currentPosition) {
        $rootScope.currentPosition = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
        $scope.geocoder = new google.maps.Geocoder();
        initializeMap();

        // Create a marker representing user's current location
        var image = 'img/current.png';
        $scope.currentMarker = new google.maps.Marker({
          position: $rootScope.currentPosition,
          map: $scope.map,
          icon: image
        });

      }, function(error) {
        console.log("Could not get current location");
      });

    var refreshLocation = function(currentPosition) {
      console.log($scope.currentMarker);
      console.log($scope.currentMarker.position);
      $rootScope.currentPosition = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
      $scope.currentMarker.setPosition($rootScope.currentPosition);
      console.log($scope.currentMarker.position);
    };

    // Update current location periodically
    $cordovaGeolocation.watchPosition({
      maximumAge: 10000,
      timeout: 5000,
      enableHighAccuracy: true
    }).then(null, function(err) {
        console.log(err);
      }, refreshLocation
    );
  };

  var infowindow = new google.maps.InfoWindow({ content: 'Selected' });

  $scope.currentLocation = function() {
    $scope.map.setCenter($rootScope.currentPosition);
  };

  var markers = [];
  var markerID = 0;
  $scope.createMarker = function(position) {

    // Save the location of where the marker is created
    // to access from the compass
    $rootScope.markerPosition = position;

    var marker = new google.maps.Marker({
      map: $scope.map,
      animation: google.maps.Animation.DROP,
      draggable: true,
      position: position
    });

    marker.id = markerID;
    markerID++;
    markers.push(marker);

    marker.addListener('click', function() {
      $scope.markerID = this.id;
      if (document.getElementById('deleteMarkerButton').style.display === 'block') {
        document.getElementById('setArrowButton').style.display = 'none';
        document.getElementById('deleteMarkerButton').style.display = 'none';
        document.getElementById('currentLocButton').style.display = 'block';
      } else {
        document.getElementById('setArrowButton').style.display = 'block';
        document.getElementById('deleteMarkerButton').style.display = 'block';
        document.getElementById('currentLocButton').style.display = 'none';
      }
      infowindow.open($scope.map, marker);
    });

    if (position === $rootScope.currentPosition) $scope.map.setCenter(position);

  }; // end createMarker

  $scope.deleteMarker = function(markerID) {
    for (var i = 0; i < markers.length; i++) {
      if (markers[i].id === markerID) {
        markers[i].setMap(null);
        markers.splice(i, 1);
        document.getElementById('deleteMarkerButton').style.display = 'none';
        document.getElementById('setArrowButton').style.display = 'none';
        document.getElementById('currentLocButton').style.display = 'block';
        return;
      }
    }
  }; // end deleteMarker

  // geocodes a human readable address & stores long/lat in var coordsResult
  $scope.geocodeAddress = function(geocoder, map) {

    var address = document.getElementById('address').value;

    $scope.geocoder.geocode({'address': address}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        $scope.map.setCenter(results[0].geometry.location);
        var coordsResult = results[0].geometry.location;
        console.log(coordsResult);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });

  }; // end geocodeAddress

  document.addEventListener('deviceready', initialize, false);
})

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});


.controller('CompassCtrl', function($rootScope, $scope, $state, $cordovaDeviceOrientation, $cordovaGeolocation, $ionicScrollDelegate) {
  document.addEventListener("deviceready", function () {
    // see http://ngcordova.com/docs/plugins/geolocation
    var locationOptions = {
      timeout: 3000,
      maximumAge: 10000,
      enableHighAccuracy: true // may cause errors if true
    };

    var update = function() {
      $cordovaGeolocation.getCurrentPosition(locationOptions)
        .then(function(position) {
          $scope.here = turf.point([position.coords.latitude, position.coords.longitude]);
          $scope.there = turf.point([$rootScope.markerPosition["J"], $rootScope.markerPosition["M"]]);
          $scope.bearing = turf.bearing($scope.here, $scope.there);
          $scope.distance = Number(turf.distance($scope.here, $scope.there, 'miles')).toFixed(2);
        }, function(err) {
          console.log(err);
        });
    };

    setInterval(update, 1000);

    // see http://ngcordova.com/docs/plugins/deviceOrientation
    var orientationOptions = { frequency: 100 };   // how often the watch updates

    $scope.watch = $cordovaDeviceOrientation.watchHeading(orientationOptions).then(
      null,
      function(err) {
        $scope.heading = err;
      },
      function(result) {
        $scope.rotation = 'transform: rotate('+ Math.floor($scope.bearing - result.magneticHeading + 90) +'deg)';
      });

    }, false);
});

