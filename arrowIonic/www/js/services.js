angular.module('starter.services', [])

.factory('Firebase', [
  function() {

    var _hunts = [];
    var service = {};
    var firebase = new Firebase('https://boiling-heat-1054.firebaseio.com/');

    service.addHunt = function(hunt) {
      var newHunt = firebase.push(hunt);
      return newHunt;
    };

    // listener to sync hunts from server
    firebase.on('value', function(snapshot) {
      _hunts = snapshot.val();
    });

    service.getHunts = function() {
      return _hunts;
    };

    return service;
  }
]);
