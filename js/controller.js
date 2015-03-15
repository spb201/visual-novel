function isLocalStorageAvailable() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

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
	checkImage($scope);
}

//quest viewer support function
function checkImage($scope) {
	if ($scope.node.image) {
		$scope.imagesrc = "i/quest" + quest.quest_id + "/" + $scope.node.id + ".png";
	}
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

angular.module("ngApp", [])
//quest visual redactor
	.controller("structureController", function($scope) {
		 $scope._q = angular.fromJson(sessionStorage.getItem('quest'));
		 $scope.input = function() {
			$scope._q = angular.fromJson($scope.questInput);
		 }
		 $scope.save = function() {
			console.log($scope._q.nodes[0].ways[0]);
			$scope.questInput = angular.toJson($scope._q);
		 }
		 $scope.add = function() {
			if ($scope._q) {
				$scope._q.nodes.push({"id":$scope._q.nodes.length, "ways":[], "ways_ids":[]});
			}
			else {
				$scope._q = {"quest_id":Math.round(Math.random()*1000), "nodes":[]};
				$scope._q.nodes.push({"id":$scope._q.nodes.length, "ways":[], "ways_ids":[]});
			}
		 }
		 $scope.pop = function() {
			$scope._q.nodes.pop();
		 }
		 $scope.remove = function(i) {
			$scope._q.nodes.splice(i, 1);
			for (j = i; j < $scope._q.nodes.length; ++j) {
				$scope._q.nodes[j].id--;	
			};
		 }
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
					stack: "#drag-node",
					containment: "parent"
				});
			}
		};
	})
//quest creator
	.controller("creatorController", function($scope, $http, $window) {
		$scope.quest = {"title":"generated quest","nodes":[]};
		$scope.newNodeId = 0;
		$scope.selectedNodeId = 0;
		$scope.add = function() {
			node = {"id":$scope.newNodeId, "text": $scope.user_text};
			var ways_ids = [];
			var ways = [];

			for (i = 0; i < 4; ++i) {
				if ($scope.buttons[i] !== null && $scope.buttons_dest[i] !== null) {
					ways_ids.push(parseInt($scope.buttons_dest[i]));
					ways.push($scope.buttons[i]);
				}
			}

			if ($scope.isNodeFinal)
				node.final = true;
			node.ways_ids = ways_ids;
			node.ways = ways;
			
			$scope.quest.nodes.push(node);
			++$scope.newNodeId;
			$scope.selectedNodeId = $scope.newNodeId;
		}
		$scope.generate = function() {
			$scope.result = angular.toJson($scope.quest);		
			if (isLocalStorageAvailable()) {
				sessionStorage.setItem('quest', $scope.result);	
			}
		}
		$scope.save = function() {
			if ($scope.result !== undefined) {
				if ($scope.fileName !== undefined)
					download($scope.fileName + '.json', $scope.result);
				else
					download('quest.json', $scope.result);
			} else $window.alert('You should generate your quest before downloading');
		}
	})
//quest maker controller
	.controller("contentController", function($scope, $http) {
		$scope.hideButtons = [false, false, false, false];
		$scope.chooseButtons = function() {
			if (!$scope.node.final)
				for (i = 0; i < 4; ++i)
					$scope.hideButtons[i] = ($scope.node.ways_ids[i] === undefined || $scope.node.ways_ids[i] === null);
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
			downloadQuest($scope, $http, "q/quest" + i.toString() + ".json");
		};
		$scope.custom = function() {
			quest = angular.fromJson($scope.str_quest);
			$scope.node = quest.nodes[0];
			$scope.hideStart = true;
			$scope.showControlButtons = true;
			$scope.showText = true;
			$scope.chooseButtons();
			checkImage($scope);
		};
		$scope.showContent = function($fileContent){
			$scope.str_quest = $fileContent;
		};
	})
//Magic directive that helps to download quests (have no idea how it works)
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
	});
