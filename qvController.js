function isLocalStorageAvailable() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function startGame($scope) {
	$scope.chooseButtons();
	$scope.hideStart = true;
	$scope.showControlButtons = true;
	$scope.showText = true;
	checkImage($scope);
}

function checkImage($scope) {
	if ($scope.node.image) {
		$scope.imagesrc = "/quest" + quest.quest_id + "/" + $scope.node.id + ".png";
	}
}

function downloadQuest($scope, $http, url) {
	$http.get(url).
				success(function(data, status, headers, config) {
					quest = data;
					$scope.node = quest.nodes[0];
					startGame($scope);
				}).
				error(function(data, status, headers, config) {
					$scope.startError = true;
				});
}

angular.module("ngApp", [])
.controller("contentController", function($scope, $http) {
	$scope.hideButtons = [false, false, false, false];
	$scope.chooseButtons = function() {
		if (!$scope.node.final) {
			$scope.hideButtons[0] = false;
			$scope.hideButtons[2] = true;
			$scope.hideButtons[3] = true;
			if ($scope.node.ways.length == 1) {
				$scope.hideButtons[1] = true;
				$scope.hideButtons[2] = true;
				$scope.hideButtons[3] = true;
			}
			if ($scope.node.ways.length == 3) {
				$scope.hideButtons[2] = false;
			}
			if ($scope.node.ways.length == 4) {
				$scope.hideButtons[2] = false;
				$scope.hideButtons[3] = false;
			}
		}
	};
	$scope.loadLastGenerated = function() {
			if (isLocalStorageAvailable()) {
				if (sessionStorage.getItem('quest') != undefined) {
					quest = angular.fromJson(sessionStorage.getItem('quest'));
					$scope.node = quest.nodes[0];
					startGame($scope);
				}
				else
					$scope.lastGenError = true;
			}
	}
	$scope.buttonClick = function(i) {
		if (i != null) {
			$scope.node = quest.nodes[$scope.node.ways_ids[i]];
			$scope.chooseButtons();
			if ($scope.node.final) {
				$scope.showControlButtons = false;
				$scope.showRestartButton = true;
			}
			checkImage($scope);
		}
	};
	$scope.restart = function() {
		$scope.showRestartButton = false;
		$scope.hideStart = false;
		$scope.showText = false;
	};
	$scope.start = function(i) {
		downloadQuest($scope, $http, "/quest" + i.toString() + ".json");
	};
	$scope.custom = function() {
		quest = angular.fromJson($scope.str_quest);
		$scope.node = quest.nodes[0];
		$scope.hideStart = true;
		$scope.showControlButtons = true;
		$scope.showText = true;
		$scope.chooseButtons();
		checkImage($scope);
	}
});
