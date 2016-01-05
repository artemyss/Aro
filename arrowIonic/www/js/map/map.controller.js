angular.module('app')
.controller('MapCtrl', function($scope, $cordovaGeolocation, coordinates) {

  var map;
  var geocoder;

  // initialize map if geolocation of user was successfully retrieved
  $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: true})
    .then(function(currentPosition) {
      coordinates.userLocation = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
      map = initializeMap(coordinates.userLocation);
      geocoder = new google.maps.Geocoder();
    }, function(error) {
      console.log("Could not get current location");
    }); // end cordovaGeolocation

  var initializeMap = function(currentPosition) {
    var mapOptions = {
      center: currentPosition,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
    };
    var googleMap = new google.maps.Map(document.getElementById("map"), mapOptions);

    google.maps.event.addDomListener(googleMap, 'mousedown', function(e){
      // save coordinates of where user clicks
      // this is passed into $scope.createMarker(position)
      $scope.mouseLatLng = e.latLng;
      if (document.getElementById('deleteMarkerButton').style.display === 'block') {
        document.getElementById('setArrowButton').style.display = 'none';
        document.getElementById('deleteMarkerButton').style.display = 'none';
        document.getElementById('currentLocButton').style.display = 'block';
      }
      infowindow.close();
    });

    return googleMap
  }; // end initializeMap

  // callback function to re-center map to user's current location
  $scope.goToCurrentLocation = function() {
    map.setCenter(coordinates.userLocation);
  };

  // callback function to convert address to Google Maps compatible coordinates
  $scope.geocodeAddress = function() {

    var address = document.getElementById('address').value;

    geocoder.geocode({'address': address}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }; // end geocodeAddress

  var markers = [];
  var markerID = 0;
  var infowindow = new google.maps.InfoWindow({ content: 'Selected' });

  $scope.createMarker = function(position) {
    position = position || coordinates.userLocation;

    // Save the location of where the marker is created
    // to access from the compass
    coordinates.markerLocation = position;

    var marker = new google.maps.Marker({
      map: map,
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
      infowindow.open(map, marker);
    });
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
});