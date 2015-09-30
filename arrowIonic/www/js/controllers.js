angular.module('starter.controllers', [])

.controller('MapCtrl', function($rootScope, $scope, $cordovaGeolocation) {

  // Get geolocation of user's current position and initialize map
  $cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: true})
    .then(function(currentPosition) {

      $rootScope.currentPosition = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
      $scope.geocoder = new google.maps.Geocoder();
      initializeMap($rootScope.currentPosition);

    }, function(error) {
      console.log("Could not get current location");
    }); // end cordovaGeolocation

  var initializeMap = function(currentPosition) {

    var mapOptions = {
      center: currentPosition,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    google.maps.event.addDomListener($scope.map, 'mousedown', function(e){
      $scope.mousePosition = e.latLng;
      if (document.getElementById('deleteMarkerButton').style.display === 'block') {
        document.getElementById('deleteMarkerButton').style.display = 'none';
      }
      infowindow.close();
    });

  }; // end initializeMap

  var infowindow = new google.maps.InfoWindow({ content: '<div id="content"><div id="bodyContent"><a href="#/tab/compass"> CLICK HERE </a></div></div>' });

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
        document.getElementById('deleteMarkerButton').style.display = 'none';
      } else {
        document.getElementById('deleteMarkerButton').style.display = 'block';
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
/*----------when user enters map tab view this loads current location view-----*/
  // $scope.$on('$ionicView.enter', function(){
  //   $scope.center();
  // });


/*optional array to store addresses if needed
  $scope.list = [];
  $scope.text = '';
  $scope.submit = function() {
    if ($scope.text) {
      $scope.list.push(this.text);
      $scope.text = '';
    }
  };
*/


/*-------geocodes a human readable address & stores long/lat in var coordsResult------*/


  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});


.controller('CompassCtrl', function($rootScope, $scope, $state, $cordovaDeviceOrientation) {
  // see http://ngcordova.com/docs/plugins/deviceOrientation


  document.addEventListener("deviceready", function () {

    $scope.heading;

    var options = {
      frequency: 20,   // if frequency is set, filter is ignored
      // filter: 3         // degrees of change before refresh
    };

    $scope.watch = $cordovaDeviceOrientation.watchHeading(options).then(
      null,
      function(error) {
        $scope.heading = err;
      },
      function(result) {  // updates constantly (depending on frequency value)
        $scope.heading = 'transform: rotate(-'+ result.trueHeading +'deg)';
        //  try result.magneticHeading?
      });


    // watch.clearWatch();
    // // OR
    // $cordovaDeviceOrientation.clearWatch(watch)
    //   .then(function(result) {Success!}, function(err) {error});

    }, false);
});



/*--------------------------google places autocomplete attempt ---------------------------/

      $scope.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -33.8688, lng: 151.2195},
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });

  $scope.initAutocomplete = function() {
      // Create the search box and link it to the UI element.
      $scope.input = document.getElementById('pac-input');
      console.log($scope.input);
      $scope.searchBox = new google.maps.places.SearchBox($scope.input);
      console.log($scope.searchBox);
      $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push($scope.input);

      // Bias the SearchBox results towards current map's viewport.
      $scope.map.addListener('bounds_changed', function() {
        $scope.searchBox.setBounds($scope.map.getBounds());
      });
      $scope.markers = [];
      // [START region_getplaces]
      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      $scope.searchBox.addListener('click', function() {
        $scope.places = $scope.searchBox.getPlaces();



        if ($scope.places.length == 0) {
          return;
        }

        // Clear out the old markers.
        $scope.markers.forEach(function(marker) {
          marker.setMap(null);
        });
        $scope.markers = [];

        // For each place, get the icon, name and location.
        $scope.bounds = new google.maps.LatLngBounds();
        console.log($scope.bounds);
        $scope.places.forEach(function(place) {
          var icon = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

          // Create a marker for each place.
          $scope.markers.push(new google.maps.Marker({
            map: map,
            icon: icon,
            title: place.name,
            position: $scope.place.geometry.location
          }));

          if ($scope.place.geometry.viewport) {
            // Only geocodes have viewport.
            $scope.bounds.union(place.geometry.viewport);
          } else {
            $scope.bounds.extend(place.geometry.location);
          }
        });
        $scope.map.fitBounds(bounds);
      });
      console.log($scope.places);
      // [END region_getplaces]
    }
 */


