angular.module('app')
.controller('MapCtrl', function($scope, $cordovaGeolocation, coordinates) {

  var initializeMap = function(currentPosition) {

    var mapOptions = {
      center: currentPosition,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    google.maps.event.addDomListener($scope.map, 'mousedown', function(e){
      // Reference to where user clicks that is passed into $scope.createMarker(position)
      $scope.mousePosition = e.latLng;
      if (document.getElementById('deleteMarkerButton').style.display === 'block') {
        document.getElementById('setArrowButton').style.display = 'none';
        document.getElementById('deleteMarkerButton').style.display = 'none';
        document.getElementById('currentLocButton').style.display = 'block';
      }
      infowindow.close();
    });

  }; // end initializeMap

  // Get geolocation of user's current position and initialize map
  $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: true})
    .then(function(currentPosition) {
      coordinates.userLocation = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
      $scope.geocoder = new google.maps.Geocoder();
      initializeMap(coordinates.userLocation);

    }, function(error) {
      console.log("Could not get current location");
    }); // end cordovaGeolocation

  // Callback function for button in view to re-center map to user's current location
  $scope.currentLocation = function() {
    $scope.map.setCenter(coordinates.userLocation);
  };

  var markers = [];
  var markerID = 0;
  var infowindow = new google.maps.InfoWindow({ content: 'Selected' });

  // Callback function that will be invoked by 'on-hold' directive on #map
  $scope.createMarker = function(position) {
    // 'position' parameter is provided by $scope.mousePosition

    // Save the location of where the marker is created
    // to access from the compass
    coordinates.markerLocation = position;

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

    /* Not sure what this line does.
    if (position === coordinates.userLocation) $scope.map.setCenter(position);
    */

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

})

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

