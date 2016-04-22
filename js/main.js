/**
* Main AngularJS Web Application
*/

var app = angular.module('lowCostFlightsWebApp', []);

app.controller("AirportController", [ '$scope', '$resource',
		function($scope, $resource) {
			//
			// GET Action Method
			//
			var Airport = $resource('http://digress.me:8080/airport/ZAG', {});
			Airport.get( {}, function(airport){
				$scope.airport = airport;
        console.log(airport);
			})

		} ]);
