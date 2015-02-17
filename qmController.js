var quest = {}

function hideSomeButtons($scope) {
	$scope.hideSecondButton = false;
	$scope.hideThirdButton = true;
	$scope.hideFourthButton = true;
	if ($scope.json.ways.length == 1) {
		$scope.hideSecondButton = true;
	}
	if ($scope.json.ways.length == 3) {
		$scope.hideThirdButton = false;			
	}
	if ($scope.json.ways.length == 4) {
		$scope.hideThirdButton = false;			
		$scope.hideFourthButton = false;			
	}
}

function downloadQuest($scope, $http, currentQuest, url) {
	$http.get(url).
				success(function(data, status, headers, config) {
					$scope.json = data;
					currentQuest = $scope.json;
				}).
				error(function(data, status, headers, config) {
					$scope.startError = true;
				});
}

var currentQuest;

angular.module("ngApp", [])
.controller("contentController", function($scope, $http) {
	$scope.str_quest = '{"text":"this quest is really short","first": "left","second": "right","final": false,"ways":[{"text":"you win","final":true},{"text": "you lose","final": true}]}';
	$scope.buttonClick = function(i) {
		$scope.json = $scope.json.ways[i];
		if ($scope.json.final) {
			$scope.showControlButtons = false;
			$scope.showRestartButton = true;
		}
	};
	$scope.restart = function() {
		$scope.showRestartButton = false;
		$scope.json = currentQuest;
		$scope.hideStart = false;
		$scope.showText = false;
		hideSomeButtons($scope);
	};
	$scope.start = function(i) {
		downloadQuest($scope, $http, currentQuest, "http://grdesu.github.io/quest" + i.toString() + ".json");
		$scope.hideStart = true;
		$scope.showControlButtons = true;
		$scope.showText = true;
		hideSomeButtons($scope);
	};
	$scope.custom = function() {
		//downloadQuest($scope, $http, currentQuest, $scope.q_url);
		$scope.json = angular.fromJson($scope.str_quest);
		$scope.hideStart = true;
		$scope.showControlButtons = true;
		$scope.showText = true;
		hideSomeButtons($scope);
	}
});
