var BACKEND_API_URL = "http://localhost:8080";

var app = angular.module('lowCostFlightsWebApp', ['ngAnimate', 'ui.bootstrap']);

app.factory("lowCostFlightsService", ['$http', '$q', function($http, $q) {
    return {
        search: function(params) {
            return $http.get(BACKEND_API_URL + '/search', {
                    params: params
                })
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
            return $http.get(BACKEND_API_URL + '/airport/' + iata_code)
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
        findAirports: function(name, limit) {
            return $http.get(BACKEND_API_URL + '/airport/find', {
                    params: {
                        name: name,
                        limit: limit
                    }
                })
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

app.controller("flightSearchController", ['$scope', '$filter', '$timeout', 'lowCostFlightsService', function($scope, $filter, $timeout, lowCostFlightsService) {
    $scope.loading = false;
    $scope.departurePlaceholder = $filter('date')(new Date(), 'dd.MM.yyyy');
    $scope.returnPlaceholder = $filter('date')(new Date(new Date().getTime() + 24 * 60 * 60 * 1000), 'dd.MM.yyyy');
    $scope.params = {
        origin: null,
        destination: null,
        departure: new Date(),
        return: null,
        adults: 1,
        children: 0,
        infants: 0,
        currency: "EUR"
    };
    $scope.airports = [];
    $scope.flights = [];
    $scope.showResults = false;

    $scope.afterAirportSelect = function(item, source) {
        if (source == 'origin') {
            $scope.params.origin = item.iata_code;
        } else if (source == 'destination') {
            $scope.params.destination = item.iata_code;
        }
    };

    $scope.findAirports = function(name, limit) {
        if (name && name.length >= 3) {
            $scope.airports = [];
            if (name.length == 3 && name == name.toUpperCase()) {
                lowCostFlightsService.getAirport(name).then(
                    function(response) {
                        $scope.airports = [response];
                    },
                    function(errResponse) {
                        console.error("No airport with IATA code " + name);
                    }
                );
            } else {
                lowCostFlightsService.findAirports(name, limit).then(
                    function(response) {
                        $scope.airports = response;
                    },
                    function(errResponse) {
                        console.error('Error while fetching airports');
                    }
                );
            }
        }
    };

    $scope.search = function(params) {
        $scope.loading = true;
        var getParams = angular.copy(params);
        // set correct string representation of deparure and return dates
        getParams.departure ? getParams.departure = $filter('date')(getParams.departure, 'yyyy-MM-dd') : null;
        getParams.return ? getParams.return = $filter('date')(getParams.return, 'yyyy-MM-dd') : null;

        lowCostFlightsService.search(getParams).then(
            function(response) {
                $scope.flights = [];
                angular.forEach(response, function(item) {
                    item.departure_datetime ? new Date(item.departure_datetime) : null;
                    item.return_datetime ? new Date(item.return_datetime) : null;
                    $scope.flights.push(item);
                });
                $scope.showResults = true;
                $scope.loading = false;
            },
            function(errResponse) {
                console.error('Error while fetching flights');
                $scope.loading = false;
            }
        );
    };

    // datepickers
    $scope.departureDatepicker = {
        show: false,
        options: {
            minDate: new Date()
        }
    };

    $scope.returnDatepicker = {
        show: false,
        options: {
            minDate: new Date()
        }
    };
    $scope.updateDatepickerReturnMinDate = function(date) {
        $scope.returnDatepicker.options.minDate = date;
    };

    $scope.showDatepicker = function($event, direction) {
        // @see: http://stackoverflow.com/a/24147266
        $event.preventDefault();
        $event.stopPropagation();
        if (direction == 'departure') {
            $timeout(function() {
                $scope.departureDatepicker.show = true;
                $scope.returnDatepicker.show = false;
            }, 10);
        } else if (direction == 'return') {
            $timeout(function() {
                $scope.returnDatepicker.show = true;
                $scope.departureDatepicker.show = false;
            }, 10);
        }
    };

}]);
