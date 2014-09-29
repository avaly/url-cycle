/**
 * TODO
 */

var app = angular.module('cycleApp', ['ngRoute']);

app.factory('$shared', function($rootScope) {
	var storage = {
			configUrl: null
		},
		cached = angular.fromJson(localStorage.getItem('cycleApp'));

	if (cached) {
		storage = cached;
	}

	$rootScope.$on('save', function() {
		localStorage.setItem('cycleApp', angular.toJson(storage));
	});

	return storage;
});

app.controller('CycleCtrl', function($scope, $shared, $http, $sce) {
	$scope.entryIndex = -1;
	$scope.imgActive = [false, false];
	$scope.imgUrl = ['', ''];
	$scope.imgIndex = 1;
	$scope.frameActive = [false, false];
	$scope.frameUrl = ['', ''];
	$scope.frameIndex = 1;

	$scope.next = function() {
		var entry = $scope.entries[++$scope.entryIndex % $scope.entries.length];

		console.log('next', $scope.entryIndex, entry);

		if (entry.type === 'img') {
			$scope.showImage(entry.url);
		}
		else {
			$scope.showFrame(entry.url);
		}

		setTimeout($scope.next, entry.duration * 1000);
		$scope.$apply();
	};

	$scope.showImage = function(url) {
		$scope.imgIndex = Math.abs($scope.imgIndex - 1);
		$scope.imgUrl[$scope.imgIndex] = url;

		setTimeout(function() {
			$scope.imgActive[$scope.imgIndex] = true;
			$scope.imgActive[Math.abs($scope.imgIndex - 1)] = false;
			$scope.frameActive[0] = false;
			$scope.frameActive[1] = false;
			$scope.$apply();
		}, 1000);
	};

	$scope.showFrame = function(url) {
		$scope.frameIndex = Math.abs($scope.frameIndex - 1);
		$scope.frameUrl[$scope.frameIndex] = $sce.trustAsResourceUrl(url);

		setTimeout(function() {
			$scope.frameActive[$scope.frameIndex] = true;
			$scope.frameActive[Math.abs($scope.frameIndex - 1)] = false;
			$scope.imgActive[0] = false;
			$scope.imgActive[1] = false;
			$scope.$apply();
		}, 2000);
	};

	$http.get($shared.configUrl)
		.success(function(data) {
			$scope.index = 0;
			$scope.entries = data.entries;
			setTimeout($scope.next, 0);
		})
		.error(function() {
			console.log('$http.get error', arguments);
		});
});

app.controller('ConfigCtrl', function($scope, $shared, $http, $rootScope) {
	$scope.configUrl = $shared.configUrl;

	$scope.save = function(e) {
		console.log('save', $scope.configUrl);
		$shared.configUrl = $scope.configUrl;
		$rootScope.$broadcast('save');
	};
});

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider
		.when('/cycle', {
			templateUrl: 'cycle.html',
			controller: 'CycleCtrl'
		})
		.when('/config', {
			templateUrl: 'config.html',
			controller: 'ConfigCtrl'
		})
		.otherwise({
			redirectTo: '/cycle'
		});
}]);

function init() {

}
