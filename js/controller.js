//magic function that helps to download quest as file
function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

//quest viewer support function
function startGame($scope) {
	$scope.chooseButtons();
	$scope.hideStart = true;
	$scope.showControlButtons = true;
	$scope.showText = true;
}

//quest viewer support function
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

angular.module("ngApp", ["firebase"])
//add underscorejs support
	.constant('_', window._)
	.run(function ($rootScope) {
		$rootScope._ = window._;
	})
//quest maker controller
	.controller("makerController", ["$scope", "$firebaseArray", function($scope, $firebaseArray) {
		var ref = new Firebase("https://spb201.firebaseio.com/");
		$scope.parseInt = parseInt;
		$scope.quests = $firebaseArray(ref);
		$scope.input = function() {
			$scope._q = angular.fromJson($scope.questInput);
		}
		$scope.save = function() {
			$scope.questInput = angular.toJson($scope._q);
		}
		$scope.saveToServer = function() {
		 	$scope.quests.$add(angular.toJson($scope._q));
		}
		$scope.add = function() {
			if ($scope._q) {
				$scope._q.nodes.push({"id": '' + $scope._q.nodes.length});
			}
			else {
				$scope._q = {"quest_id":Math.round(Math.random()*1000), "nodes":[]};
				$scope._q.nodes.push({"id": '' + $scope._q.nodes.length});
			}
		}
		$scope.pop = function() {
			$scope._q.nodes.pop();
		}
		$scope.remove = function(i) {
			console.log('trying to remove node w/ id ' + i);
			$scope._q.nodes.splice(''+i, 1);
		}
		$scope.saved = function(savedQuest) {
			$scope._q = JSON.parse(savedQuest);
		};
		$scope.getTitle = function(value){
			var object = JSON.parse(value);
			return object.title;
		};
		$scope.addWay = function(i) {
			if (!$scope._q.nodes[i].ways) $scope._q.nodes[i].ways = [];
			if (!$scope._q.nodes[i].ways_ids) $scope._q.nodes[i].ways_ids = [];
			$scope._q.nodes[i].ways.push('');
			$scope._q.nodes[i].ways_ids.push('');
		}
	}])
//quest viewer controller
	.controller("viewerController", ["$scope", "$http", "$firebaseArray", function($scope, $http, $firebaseArray) {
		var ref = new Firebase("https://spb201.firebaseio.com/");
		$scope.quests = $firebaseArray(ref);
		$scope.buttonClick = function(i) {
			$scope.node = quest.nodes[$scope.node.ways_ids[i]];
			if ($scope.node.final) {
					$scope.showControlButtons = false;
					$scope.showRestartButton = true;
			}
		};
		$scope.restart = function() {
			$scope.showRestartButton = false;
			$scope.hideStart = false;
			$scope.showText = false;
			$scope.node.image = false;
		};
		$scope.custom = function() {
			quest = angular.fromJson($scope.str_quest);
			$scope.node = quest.nodes[0];
			$scope.hideStart = true;
			$scope.showControlButtons = true;
			$scope.showText = true;
		};
		$scope.saved = function(savedQuest) {
			quest = JSON.parse(savedQuest);
			$scope.node = quest.nodes[0];
			$scope.hideStart = true;
			$scope.showControlButtons = true;
			$scope.showText = true;
		};
		$scope.showContent = function($fileContent){
			$scope.str_quest = $fileContent;
		};
		$scope.getTitle = function(value){
			var object = JSON.parse(value);
			return object.title;
		};
	}])
//Magic directive that helps to download quests
	.directive('onReadFile', function ($parse) {
		return {
			restrict: 'A',
			scope: false,
			link: function(scope, element, attrs) {
				var fn = $parse(attrs.onReadFile);
				element.on('change', function(onChangeEvent) {
					var reader = new FileReader();
					reader.onload = function(onLoadEvent) {
						scope.$apply(function() {
							fn(scope, {$fileContent:onLoadEvent.target.result});
						});
					};
					reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
				});
			}
		};
	})
	// This makes any element draggable
// Usage: <div draggable>Foobar</div>
	.directive('draggable', function() {
		return {
			// A = attribute, E = Element, C = Class and M = HTML Comment
			restrict:'A',
			//The link function is responsible for registering DOM listeners as well as updating the DOM.
			link: function(scope, element, attrs) {
				element.draggable({
					stack: ".drag-node",
					distance: 0,
					containment: "parent"
				});
			}
		};
	});
