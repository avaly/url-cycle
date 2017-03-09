/**
 * URL-Cycle
 *
 * Cycles through a configurable list of URLs of sites or images
 */

var app = angular.module('cycleApp', ['ngRoute']);

app.factory('$shared', function($rootScope) {
	var storage = {
			configUrl: window.location.origin + '/config.json'
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
	$scope.status = '';
	$scope.entryIndex = -1;
	$scope.imgActive = [false, false];
	$scope.imgUrl = ['', ''];
	$scope.imgIndex = 1;
	$scope.frameActive = [false, false];
	$scope.frameSize = [['100%', '100%'], ['100%', '100%']];
	$scope.frameUrl = ['', ''];
	$scope.frameIndex = 1;

	$scope.next = function() {
		var entry = $scope.entries[++$scope.entryIndex % $scope.entries.length];

		// console.log('next', $scope.entryIndex, entry);
		if (entry.type === 'img') {
			$scope.showImage(entry.url);
		}
		else {
			$scope.showFrame(entry);
		}

		setTimeout($scope.next, entry.duration * 1000);
		$scope.$apply();
	};

	function prepareUrl(url) {
		return url + (url.indexOf('?') > -1 ? '&' : '?') + 'r=' + Math.random() * 1000000;
	}

	$scope.showImage = function(url) {
		$scope.imgIndex = Math.abs($scope.imgIndex - 1);
		$scope.imgUrl[$scope.imgIndex] = prepareUrl(url);

		setTimeout(function() {
			$scope.status = url;
			$scope.imgActive[$scope.imgIndex] = true;
			$scope.imgActive[Math.abs($scope.imgIndex - 1)] = false;
			$scope.frameActive[0] = false;
			$scope.frameActive[1] = false;
			$scope.$apply();
		}, 1000);
	};

	$scope.showFrame = function(entry) {
		$scope.frameIndex = Math.abs($scope.frameIndex - 1);
		$scope.frameUrl[$scope.frameIndex] = $sce.trustAsResourceUrl(prepareUrl(entry.url));

		setTimeout(function() {
			$scope.status = entry.url;
			$scope.frameActive[$scope.frameIndex] = true;
			$scope.frameActive[Math.abs($scope.frameIndex - 1)] = false;
			$scope.frameSize[$scope.frameIndex] = [
				entry.width || '100%',
				entry.height || '100%'
			];
			$scope.imgActive[0] = false;
			$scope.imgActive[1] = false;
			$scope.$apply();
		}, 1000);
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

app.controller('ConfigCtrl', function($scope, $shared, $http, $rootScope, $location) {
	$scope.saved = false;
	$scope.configUrl = $shared.configUrl;

	function items() {
		$http.get($shared.configUrl)
			.success(function(data) {
				$scope.items = data.entries;
			})
			.error(function() {
				console.log('$http.get error', arguments);
			});
	}
	items();

	$scope.save = function(e) {
		$shared.configUrl = $scope.configUrl;
		$rootScope.$broadcast('save');
		$scope.saved = true;
		items();
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
