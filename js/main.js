var app = angular.module('lowCostFlightsWebApp', ['bootstrap3-typeahead']);

app.factory("lowCostFlightsService", ['$http', '$q', function($http, $q) {
    return {
        search: function(params) {
            return $http.get('http://digress.me:8080/search', params)
                .then(
                    function(response) {
                        return response.data;
                    },
                    function(errResponse) {
                        console.error('Error while performing search');
                        return $q.reject(errResponse);
                    }
                );
        },
        getAirport: function(iata_code) {
            return $http.get('http://digress.me:8080/airport/' + iata_code)
                .then(
                    function(response) {
                        return response.data;
                    },
                    function(errResponse) {
                        console.error('Error while trying to get airport');
                        return $q.reject(errResponse);
                    }
                );
        },
        findAirports: function(name) {
            return $http.get('http://digress.me:8080/airport/find?name=' + name)
                .then(
                    function(response) {
                        return response.data;
                    },
                    function(errResponse) {
                        console.error('Error while trying to find airports');
                        return $q.reject(errResponse);
                    }
                )

        }

    }
}]);

app.controller("flightSearchController", ['$scope', 'lowCostFlightsService', function($scope, lowCostFlightsService) {
    $scope.airports = [];
    $scope.flights = [];
		$scope.params = {
			origin: null,
			destination: null,
			departure: null,
			return: null,
			adults: null,
			children: null,
			infants: null,
			currency: null
		};

    $scope.airportDisplayText = function(item) {
        return "(" + item.iata_code + ") " + item.name;
    };

    $scope.afterOriginAirportSelect = function(item) {
        $scope.params.origin = item.iata_code;
    };

    $scope.afterDestinationAirportSelect = function(item) {
        $scope.params.destination = item.iata_code;
    };

    $scope.findAirports = function(name) {
        if (name.length >= 3) {
            if (name.length == 3 && name == name.toUpperCase()) {
                lowCostFlightsService.getAirport(name).then(
                    function(response) {
                        //$scope.airports = [response];
												console.log("LOG: " + JSON.stringify(response));
                    },
                    function(errResponse) {
                        console.error("No airport with IATA code " + name);
                    }
                );
            } else {
                lowCostFlightsService.findAirports(name).then(
                    function(response) {
                        //$scope.airports = response;
												console.log("LOG: " + JSON.stringify(response));
                    },
                    function(errResponse) {
                        console.error('Error while fetching airports');
                    }
                );
            }

        }
    };

    $scope.search = function(params) {
        lowCostFlightsService.search(params).then(
            function(response) {
                $scope.flights = response;
            },
            function(errResponse) {
                console.error('Error while fetching flights');
            }
        );
    };

}]);
