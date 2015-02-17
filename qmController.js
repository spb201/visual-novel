var quest = {
	"title": "SUPER QUEST",
	"text": "there's long way on the left side and a short one on the right",
	"first": "left",
	"second": "right",
	"final": false,
	"ways": [
		{
			"text": "there's worst way on the left and best one on the right",
			"first": "worst",
			"second": "best",
			"final": false,
			"ways": [
				{
					"text": "you lose, I have no idea why you should chose something",
					"final": false,
					"first": "time",
					"second": "year",
					"third": "people",
					"fourth": "way",
					"ways": [
						{
							"text": "you lose",
							"final": "true"
						},
						{
							"text": "you lose",
							"final": "true"
						},
						{
							"text": "you lose",
							"final": "true"						
						},
						{
							"text": "you lose",
							"final": "true"		
						}
					]
				},
				{
					"text": "you're on the right way",
					"first": "right",
					"second": "wait",
					"third": "left",
					"final": false,
					"ways": [
						{
							"text": "you win",
							"final": true
						},
						{
							"text": "you have to think faster, loser",
							"final": true
						},
						{
							"text": "you lose",
							"final": true
						}
					]
				}
			]
		},
		{
			"text": "you lose",
			"final": true
		}
	]
}


function hideSomeButtons($scope) {
	$scope.hideSecondButton = false;
	$scope.hideThirdButton = false;	
	$scope.hideFourthButton = true;
	if ($scope.json.ways.length == 1) {
		$scope.hideSecondButton = true;
		$scope.hideThirdButton = true;
	}
	if ($scope.json.ways.length == 2) {
		$scope.hideThirdButton = true;			
	}
	if ($scope.json.ways.length == 4) {
		$scope.hideFourthButton = false;			
	}
}

angular.module("ngApp", [])
.controller("contentController", function($scope) {
    $scope.json = quest,
	$scope.buttonClick = function(i) {
		$scope.json = $scope.json.ways[i];
		if ($scope.json.final) {
			$scope.showControlButtons = false;
			$scope.showRestartButton = true;
		}
		hideSomeButtons($scope);
	},
	$scope.restart = function() {
		$scope.showRestartButton = false;
		$scope.json = quest;
		$scope.showControlButtons = true;
		hideSomeButtons($scope);
	},
	$scope.start = function() {
		$scope.hideStart = true;
		$scope.showControlButtons = true;
		$scope.showText = true;
		hideSomeButtons($scope);
	}
});
