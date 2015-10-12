/*
* In the controller, inject Hunts factory and assign it to the scope variable
* that holds list of all hunts. e.g.:

.controller('HuntCtrl', function($scope, Hunts) {
  $scope.allHunts = Hunts;
  $scope.addHunt = function(hunt) {
    $scope.allHunts.$add(hunt);
  };
})

* Then use AngularFire provided methods $add(), $save(), $remove()
* to manipulate the hunts array.
*
* DO NOT directly modify array using push() or splice()
*
* Refer below links for more on AngularFire
* https://www.firebase.com/docs/web/libraries/ionic/guide.html
* https://www.firebase.com/docs/web/libraries/angular/quickstart.html
*
*/

angular.module('starter.services', [])

.factory('Hunts', ['$firebaseArray',
  function($firebaseArray) {
    var huntsRef = new Firebase('https://boiling-heat-1054.firebaseio.com/hunts');
    return $firebaseArray(huntsRef);
  }
]);
