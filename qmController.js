var quest = {}


function downloadQuest($scope, $http, currentQuest, url) {
	$http.get(url).
				success(function(data, status, headers, config) {
					$scope.json = data;
					currentQuest = $scope.json;
					$scope.chooseButtons();
					$scope.hideStart = true;
					$scope.showControlButtons = true;
					$scope.showText = true;
					//showControlButtons($scope);
				}).
				error(function(data, status, headers, config) {
					$scope.startError = true;
				});
}

var currentQuest;

angular.module("ngApp", [])
.controller("contentController", function($scope, $http) {
	$scope.chooseButtons = function() {
		if (!$scope.json.final) {
			$scope.hideSecondButton = false;
			$scope.hideThirdButton = true;
			$scope.hideFourthButton = true;
			if ($scope.json.ways.length == 1) {
				$scope.hideSecondButton = true;
				$scope.hideThirdButton = true;
				$scope.hideFourthButton = true;
			}
			if ($scope.json.ways.length == 3) {
				$scope.hideThirdButton = false;
			}
			if ($scope.json.ways.length == 4) {
				$scope.hideThirdButton = false;
				$scope.hideFourthButton = false;
			}
		}
	};
	//$scope.chooseButtons();
	$scope.str_quest = '{"text":"this is example quest","first":"first","second":"second","third":"third","final":false,"ways":[{"text":"you win","final":true},{"text":"you lose","final":true},{"text":"you lose","final":true}]}';
	$scope.buttonClick = function(i) {
		if (i != null) {
			$scope.json = $scope.json.ways[i];
			$scope.chooseButtons();
			if ($scope.json.final) {
				$scope.showControlButtons = false;
				$scope.showRestartButton = true;
			}
		}
	};
	$scope.restart = function() {
		$scope.showRestartButton = false;
		$scope.hideStart = false;
		$scope.showText = false;
	};
	$scope.start = function(i) {
		downloadQuest($scope, $http, currentQuest, "/quest" + i.toString() + ".json");
	};
	$scope.custom = function() {
		$scope.json = angular.fromJson($scope.str_quest);
		$scope.hideStart = true;
		$scope.showControlButtons = true;
		$scope.showText = true;
		$scope.chooseButtons();
	}
});
