angular.module('starter.controllers', [])


.controller('MapCtrl', function($scope, $state, $cordovaGeolocation) {
/*----- wrapping the 'auto center on current location' in a center func 
    that it is invoked each time the user enters map view allows for the 
    geocodeAddress function to place a marker & relocate your view. Though we 
    might want an option that allows the viewer to choose current/destination view -----*/
  $scope.center = function() {

    var options = {timeout: 10000, enableHighAccuracy: true};

    $cordovaGeolocation.getCurrentPosition(options).then(function(position){

      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      console.log(latLng);
      var mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    }, function(error){
      console.log("Could not get location");
    });
  };

/*----------when user enters map tab view this loads current location view-----*/
  $scope.$on('$ionicView.enter', function(){
    $scope.center();
  });


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
  $scope.geocoder = new google.maps.Geocoder();
  
  $scope.geocodeAddress = function(geocoder, map) {
    var address = document.getElementById('address').value;
    $scope.geocoder.geocode({'address': address}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        $scope.map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
          map: $scope.map,
          position: results[0].geometry.location
        });
        // console.log(results[0].geometry.location);
        var coordsResult = results[0].geometry.location;
        console.log(coordsResult);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };
})


  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  
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


