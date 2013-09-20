'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  beforeEach(module('bookingApp.controllers'));

  var createController;
  var scope;
  beforeEach(inject(function($controller, $rootScope) {
    createController = $controller;
    scope = $rootScope.$new();
  }));

  describe('MenuController', function() {  	

  	it('should navigate to booking on current date upon book today command', inject(function($location, $filter) {
  	  createController('MenuController', { $scope : scope });
  	  spyOn($location, 'path').andCallThrough();
  	  var dateText = $filter('date')(new Date(), 'yyyy.MM.dd');

  	  scope.bookToday();

  	  expect($location.path).toHaveBeenCalledWith('/book/' + dateText);
  	}));
  })

  describe('BookController', function() {

  	it('should set the correct booking date', function() {
  	  var dateText = '2013.09.20';
  	  createController('BookController', { $scope : scope, $routeParams : { dateText : dateText }});
  	  expect(scope.booking.date).toEqual(dateText);
  	});

  	it('should set receipt flag to false initially', function() {
  	  createController('BookController', { $scope : scope, $routeParams : { dateText : '2013.09.20' }});
  	  expect(scope.isReceipt).toBeFalsy();
  	});

  	it('should set receipt flag to true upon save', function() {
  	  createController('BookController', { $scope : scope, $routeParams : { dateText : '2013.09.20' }});
  	  scope.save();
  	  expect(scope.isReceipt).toBeTruthy();
  	});

  	it('should contain a seats list with at least a zero', function() {
  	  createController('BookController', { $scope : scope, $routeParams : { dateText : '2013.09.20' }});
  	  expect(scope.seats).toContain(0);
  	});

  	it('should have a default quantity', function() {
  	  createController('BookController', { $scope : scope, $routeParams : { dateText : '2013.09.20' }});
  	  expect(scope.booking.quantity).toEqual(0);
  	})
  })
});
