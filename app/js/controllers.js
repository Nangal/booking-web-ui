'use strict';

/* Controllers */

angular.module('bookingApp.controllers', []).
  
  controller('MenuController', function($scope, $location, $filter) {
  	$scope.bookToday = function(){
  	  var dateText = $filter('date')(new Date(), 'yyyy.MM.dd');
  	  $location.path('/book/' + dateText);
  	};
  }).

  controller('HomeController', function($scope, $location, availabilityGateway) {
    $scope.enabledDays = [];

    $scope.dateFormat = 'yy.mm.dd';

    $scope.getStatusForDay = function(date) {
      var formattedDate = $.datepicker.formatDate($scope.dateFormat, date);
      return [$.inArray(formattedDate, $scope.enabledDays) !== -1];
    };

    $scope.changeMonthYear = function(year, month) {
      availabilityGateway.getAvailabilityForMonth(year, month).
        then(function(data) {
          var days = data.
            filter(function(d) { return d.seats > 0 }).
            map(function(d) { return d.date });
          $scope.enabledDays = days;
          $('#datepicker').datepicker('refresh');
        })
    };

  	$('#datepicker').datepicker({
      firstDay : 1,
  	  dateFormat : $scope.dateFormat,
      beforeShowDay : $scope.getStatusForDay,
      onChangeMonthYear : $scope.changeMonthYear,
  	  onSelect : function(dateText, inst) {
  	  	$location.path('/book/' + dateText);
  	  	$scope.$apply();
  	  }
  	});

    var today = new Date();
    $scope.changeMonthYear(today.getFullYear(), today.getMonth() + 1);
  }).

  controller('BookController', function($scope, $routeParams, availabilityGateway, reservationGateway) {
  	$scope.booking = { date : $routeParams.dateText, quantity : 0 };

  	$scope.seats = [0];
    var date = $.datepicker.parseDate('yy.mm.dd', $routeParams.dateText);
    availabilityGateway.getAvailabilityForDay(date.getFullYear(), date.getMonth() + 1, date.getDate()).then(
      function(data) {
        for (var i = data.seats; i >= 0; i--) {
          $scope.seats[i] = i;
        };
      })

    $scope.isReceipt = false;

  	$scope.save = function() {
      reservationGateway.makeReservation({
        date: $scope.booking.date,
        name: $scope.booking.name,
        email: $scope.booking.email,
        quantity: $scope.booking.quantity
      }).
      then(function(data) {
        $scope.isReceipt = true;
        $scope.addNotificationAddress(data);
      });
  	};
  }).

  controller('NotificationsController', function($scope, $timeout, notificationGateway) {
    $scope.pollUrls = [];
    $scope.notifications = [];
    
    $scope.addNotificationAddress = function(url) {
      $scope.pollUrls.push(url);
    }

    $scope.dismiss = function(notification) {
      var index = $scope.notifications.indexOf(notification);
      $scope.notifications.splice(index, 1);
    }

    $scope.pollOnce = function() {
      for (var i = 0; i < $scope.pollUrls.length; i++) {
        var url = $scope.pollUrls[i];
        notificationGateway.getNotification(url).
          then(function(data) {
            for (var j = 0; j < data.notifications.length; j++) {
              $scope.notifications.push(data.notifications[j]);
            };
            if (data.notifications.length > 0) {
              var index = $scope.pollUrls.indexOf(data.url);
              $scope.pollUrls.splice(index, 1);
            }
          })
      };
    }

    $scope.poll = function() {
      $timeout(function() {
        $scope.pollOnce();
        $scope.poll();
      }, 5000);
    }

    $scope.poll();
  });