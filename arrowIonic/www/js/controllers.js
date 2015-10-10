angular.module('starter.controllers', [])

.controller('MapCtrl', function($rootScope, $scope, $cordovaGeolocation, $state) {
  var geo = google.maps.geometry.spherical;
  var initialize = function() {
    var getLocation = function() {
      $cordovaGeolocation.getCurrentPosition(watchOptions)
        .then(refreshLocation, function(error) {
          console.log('Could not get current location');
          setTimeout(getLocation, 1000);
        });
    };

    var refreshLocation = function(currentPosition) {
      $rootScope.currentPosition = new google.maps.LatLng(currentPosition.coords.latitude, currentPosition.coords.longitude);
      $scope.currentMarker.setPosition($rootScope.currentPosition);

      if ($rootScope.markerPosition) {
        $rootScope.destHeading = geo.computeHeading($rootScope.currentPosition, $rootScope.markerPosition);
        $rootScope.distance =
          geo.computeDistanceBetween($rootScope.currentPosition, $rootScope.markerPosition) * 0.00062137; // meters -> miles
        if ($rootScope.distance < 0.2 && $rootScope.nextCheckpoint && typeof $rootScope.nextCheckpoint === 'function') {
          $rootScope.nextCheckpoint();
        }
      }
      setTimeout(getLocation, 1000);
    };

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

      setTimeout(getLocation, 1000);
    };

    var watchOptions = {
      maximumAge: 3000,
      timeout: 5000,
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
        console.log('Could not get current location');
      });
  };

  var infowindow = new google.maps.InfoWindow({ content: 'Selected' });

  $scope.currentLocation = function() {
    $scope.map.setCenter($rootScope.currentPosition);
  };

  $scope.allTitles = ["New York", "Oregon", "Texas", "Florida"];
  $scope.allDesc = [
    "Desc 1",
    "Desc 2",
    "Desc 3",
    "Desc 4",
  ];
  $rootScope.hunt = [];

  $scope.countB = 0;


  $scope.makeCheckpoint = function (position) {
    this.name = $scope.allTitles[$scope.countB++];
    this.desc = $scope.allDesc[$scope.countB];
    this.position = position;
  };

  var markers = [];
  var markerID = 0;
  $scope.createMarker = function(position) {

    // Save the location of where the marker is created
    // to access from the compass
    $rootScope.markerPosition = position;
    $rootScope.hunt.push(new $scope.makeCheckpoint(position));
    console.log($rootScope.hunt);
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

  $scope.startHunt = function() {
    $rootScope.count = 0;
    $state.go('tab.compass');
    // go to compass view
      // outside of this controller
      // in compassctrl initialize
      // iterate over $rootScope.hunt
  };

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
    $scope.checkpoint = $rootScope.hunt[$rootScope.count];
    $rootScope.markerPosition = $scope.checkpoint.position;
    $rootScope.nextCheckpoint = function () {
      $scope.checkpoint = $rootScope.hunt[++$rootScope.count];
      if ($rootScope.count === $rootScope.hunt.length) {
        console.log("YOU WIN!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      }
      $rootScope.markerPosition = $scope.checkpoint.position;
    };
    console.log('checkpoint:', $scope.checkpoint);
    console.log('currentPosition:', $rootScope.currentPosition);
    console.log('markerPosition:', $rootScope.markerPosition);


    var locationOptions = {
      maximumAge: 3000,
      timeout: 5000,
      enableHighAccuracy: true // may cause errors if true
    };

    var orientationOptions = {frequency: 100};   // how often the watch updates

    $scope.watch = $cordovaDeviceOrientation.watchHeading(orientationOptions).then(
      null,
      function(err) {
        $scope.heading = err;
      },
      function(result) {
        $scope.rotation = 'transform: rotate('+ Math.floor($rootScope.destHeading - result.magneticHeading) +'deg)';
      });

    }, false);
})


.controller('HuntCtrl', function($rootScope, $scope) {


  // Will hold every available scavenger hunt
  $scope.allHunts = [];




  $scope.updateHunt = function(hunt){
    $rootScope.scavengerHunt = $scope.allHunts[hunt];
    console.log("Current scavenger hunt: ", $rootScope.scavengerHunt);
  };
});

