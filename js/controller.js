var FIREBASE_URL = "https://spb201.firebaseio.com/";
var _cy;
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

//returns true when quest have no final nodes
function check_final_nodes(quest) {
	count = 0;
	for (i = 0; i < quest.nodes.length; ++i) {
		if (quest.nodes[i].final) {
			count++;
		}
	}
	return (count == 0);
}

function is_all_nodes_empty(quest) {
	count = 0;
	for (i = 0; i < quest.nodes.length; ++i) {
		if (quest.nodes[i] && quest.nodes[i].ways_ids) {
			for (j = 0; j < quest.nodes[i].ways_ids.length; ++j) {
				count++;
			}
		}
	}
	return (count == 0);
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


var ngApp = angular.module("ngApp", ['ngRoute', "firebase", "infinite-scroll"])
	.config(function($routeProvider) {		
		$routeProvider
			.when('/play/:id', {
				templateUrl : 'player.html',
				controller  : 'playerController'
			})
			.when('/about', { 
				templateUrl : 'landing.html',
			})
			.when('/top', {
				templateUrl : 'viewer.html',
				controller  : 'viewerController'
			})
			.when('/user/:uid', {
				templateUrl : 'viewer.html',
				controller  : 'viewerController'
			})
			.when('/user', {
				templateUrl : 'viewer.html',
				controller  : 'viewerController'
			})
			.when('/edit/:id', {
				templateUrl : 'maker.html',
				controller  : 'makerController'
			})
			.when('/', {
				templateUrl : 'viewer.html',
				controller  : 'viewerController'
			});
	})
	.constant('_', window._)
	.run(function ($rootScope) {
		$rootScope._ = window._;
	})
	.controller("mainController", ["$scope", "$firebaseAuth", "$location", function($scope, $firebaseAuth, $location) {
		var ref = new Firebase(FIREBASE_URL);
		var auth = $firebaseAuth(ref);
		$scope.authData = auth.$getAuth();
		$scope.isAuthorized = false;
		if ($scope.authData) {
			$scope.isAuthorized = true;
		}
		$scope.login = function() {
			auth.$authWithOAuthPopup("facebook")
				.then(function(authData) {
					console.log("Authenticated successfully with payload:", authData);
					$scope.isAuthorized = true;
					document.location.reload();
				}, function(err) {
					console.log("Login Failed!", error);
				});
		};
		$scope.logout = function() {
			auth.$unauth();
			document.location = '/';
		};

		$scope.isActive = function(route) {
			var path = $location.path();
			if (route === '/') {
				return path === '/';
			}

		 	return path.indexOf(route) === 0;
		};

		$scope.go = function(path) {
		  $location.path(path);
		};
	}])
//quest maker controller
	.controller("makerController", ["$scope", "$firebaseObject", "$firebaseAuth", "$routeParams", function($scope, $firebaseObject, $firebaseAuth, $routeParams) {
		var ref = new Firebase(FIREBASE_URL);
		var questsRef = ref.child('quests');
		var auth = $firebaseAuth(ref);
		$scope.authData = auth.$getAuth();
		$scope.isAuthorized = false;
		$scope.selectNode = function(i) {
			$scope.selectedNode = $scope._q.nodes[i];
		}

		if ($scope.authData) {
			$scope.isAuthorized = true;
			if ($routeParams.id) {
				$scope.thisQuest = questsRef.child($routeParams.id);
				$scope._q = $firebaseObject($scope.thisQuest);
				$scope._q.$loaded()
					.then(function() {
						if(!$scope.$$phase) {
							$scope.$apply();
						}
					})
			} else {
				alertify.alert('Quest not found');
			}
		} else {
			alertify.alert('You\'re not logged in');
		}

		$scope.saveToServer = function() {
			if (!$scope.isAuthorized) {
				alertify.alert('You are not logged in');
			} else if ($scope._q === undefined || $scope._q === null) {
				alertify.alert('You can\'t save empty adventure');
			} else if ($scope._q.title == '' || $scope._q.title === null || $scope._q.title === undefined) {
				alertify.alert('Title can\'t be empty');
			} else if (check_final_nodes($scope._q)) {
				alertify.alert('Adventure must contain at least on final node');
			} else if (is_all_nodes_empty($scope._q)) {
				alertify.alert('All nodes can\'t be empty');
			} else if ($scope._q.title == 'empty') {
				alertify.alert('Ivan said it\'s bad to save quest with \'empty\' title');
			} else {
				$scope._q.last_change = Date.now();
				$scope._q.$save();
				alertify.alert('Successfully saved to server');
			}
		}
    $scope.add = function() {
		  if (!$scope._q) {
		    $scope._q = {nodes :[]};
		  };
			if ($scope._q && $scope._q.nodes) {
				$scope._q.nodes.push({"id":$scope._q.nodes.length});
			}
			else if ( $scope._q && ! $scope._q.nodes) {
				$scope._q.nodes = [];
				$scope._q.nodes.push({"id":$scope._q.nodes.length});	
			} else if ( ! $scope._q ){
				$scope._q = {"quest_id":Math.round(Math.random()*1000), "nodes":[]};
				$scope._q.nodes.push({"id":$scope._q.nodes.length});
			}
		}
		$scope.pop = function() {
			$scope._q.nodes.pop();
		}
		$scope.notRemoved = function(item) {
		    return !item.hide;
		};
		$scope.remove = function(i) {
			$scope._q.nodes[i].hide = true;
			$scope.selectedNode = null;
		}
		$scope.saved = function(savedQuest) {
			$scope._q = JSON.parse(savedQuest);
		};
		$scope.getValue = function(value, key){
			var object = JSON.parse(value);
			return object[key];
		}
		$scope.addWay = function(i) {
			if (!$scope._q.nodes[i].ways) $scope._q.nodes[i].ways = [];
			if (!$scope._q.nodes[i].ways_ids) $scope._q.nodes[i].ways_ids = [];
			$scope._q.nodes[i].ways.push('');
			$scope._q.nodes[i].ways_ids.push('');
		}
		$scope.hideSidebar = function() {
			$scope.hideSB = true;
		}
		
		$scope.graphBtn = function() {
			$scope.renewGraph();
		}

		$scope.logout = function() {
			auth.$unauth();
			window.location.reload();
		}

		$scope.renewGraph = function() {
			var qnodes = [];
			var qedges = [];
			if ($scope._q && $scope._q.nodes) {
				for (i = 0; i < $scope._q.nodes.length; ++i) {
					if (!$scope._q.nodes[i].hide) {
					  qnodes.push({data : { id : ''+i }});
				  	if ($scope._q.nodes[i].ways_ids) {
				  		for (j = 0; j < $scope._q.nodes[i].ways_ids.length; ++j) {
				  			qedges.push({data: { id: '' + i + j, weight: j, source: '' + i, target: '' + $scope._q.nodes[i].ways_ids[j]}});
						  }
						}
					}
				}
			}
			var cy = cytoscape({
				container: document.getElementById('graph-container'),
				style: cytoscape.stylesheet()
					.selector('node')
						.css({
							'content': 'data(id)'
						})
					.selector('edge')
						.css({
							'target-arrow-shape': 'triangle',
							'width': 4,
							'line-color': '#ddd',
							'target-arrow-color': '#ddd'
						})
					.selector('.highlighted')
						.css({
							'background-color': '#61bffc',
							'line-color': '#61bffc',
							'target-arrow-color': '#61bffc',
							'transition-property': 'background-color, line-color, target-arrow-color',
							'transition-duration': '0.5s'
						}),
				elements: {
					nodes: qnodes,
					edges: qedges
				},
				layout: {name: 'cose'}
			});
			_cy = cy;
		};
		
		$scope.$watch(
			function($scope){return $scope._q;},
			function(){if(typeof(cytoscape) !== 'undefined') $scope.renewGraph();},
			true
		);
		$scope.removeWay = function(nodeid, wayid) {
		  $scope._q.nodes[nodeid].ways.splice(wayid, 1);
		  $scope._q.nodes[nodeid].ways_ids.splice(wayid, 1);
		};
	}])
//quest viewer controller
	.controller("viewerController", ["$scope", "$http", "$firebaseArray", "$firebaseObject", "$firebaseAuth", "$location", "$routeParams",
	function($scope, $http, $firebaseArray, $firebaseObject, $firebaseAuth, $location, $routeParams) {
		$scope.uid = $routeParams.uid;
		var ref = new Firebase(FIREBASE_URL);

		var questsRef = ref.child('quests');
		var viewsRef = ref.child('views');
		var ratingsRef = ref.child('ratings');
		$scope.allQuests = $firebaseArray(questsRef);
		$scope.viewsObject = $firebaseObject(viewsRef);
		$scope.ratingsObject = $firebaseObject(ratingsRef);

		var auth = $firebaseAuth(ref);
		$scope.authData = auth.$getAuth();
		$scope.isAuthorized = false;
		itemsCount = 13;
		$scope.editQuest = function(id) {
		  $location.path('edit/' + id);
		};
		if ($scope.authData) {
			$scope.isAuthorized = true;
		}
		if ($location.$$path === '/user' && $scope.authData) {
			$location.path('/user/' + $scope.authData.uid);
		};
		$scope.newQuest = function() {
			$scope.allQuests.$add({
				descr: '',
				is_public: false,
				nodes: [],
				title: 'Untitled',
				uid: $scope.authData.uid,
				views: 0
			}).then(function(ref) {
				var id = ref.key();
				$location.path('edit/' + id);
			});
		}
		$scope.addMoreItems = function() {
			itemsCount += 3;
			$('.quests').css('display', 'inline-block');
			$('.quests:nth-of-type(n+' + itemsCount + ')').css('display', 'none');
		}

		$scope.showContent = function($fileContent){
			$scope.str_quest = $fileContent;
		};
		$scope.getValue = function(value, key){
			return value[key];
		};

		$scope.remove = function(quest) {
			$('.container.text-center').css({'-webkit-filter': 'blur(5px)', 'filter': 'blur(5px)'});
			$('#modal-remove').fadeIn();
			$scope.deletePretender = quest;
		};
		$scope.commit = function() {
		  $('.container.text-center').css({'-webkit-filter': 'none', 'filter': 'none'});
			$('#modal-remove').fadeOut();
			$scope.allQuests.$remove($scope.deletePretender);
		};
		$scope.cancel = function() {
      $('.container.text-center').css({'-webkit-filter': 'none', 'filter': 'none'});
			$('#modal-remove').fadeOut();
			$scope.deletePretender = null;
		}
		$scope.publish = function(quest) {
			quest.is_public = true;
			$scope.allQuests.$save(quest);
		};
		$scope.unpublish = function(quest) {
			quest.is_public = false;
			$scope.allQuests.$save(quest);
		};
		$scope.isActive = function(route) {
		 	return route === $location.path();
		};
		$scope.toRestart = function() {
			$scope.grats = false;
			$scope.hideStart = true;
			$scope.showRestartButton = true;
		};

		$scope.getViews = function(quest) {
			return $scope.viewsObject[quest.$id] || 0;
		};

		$scope.getRating = function(quest) {
			var rateObject = $scope.ratingsObject[quest.$id];
			if (rateObject) {
				var users = Object.keys(rateObject);
				var i;
				var sum = 0;
				for (i = 0; i < users.length; i++) {
				  sum += rateObject[users[i]];
				}
				return sum / i;
			} else {
				return 0;
			}

		};

		$scope.getAuthor = function(quest) {
			return parseInt(quest.uid.replace('facebook:', ''), 10).toString(36);
		} 

		$scope.rate = function(quest, rating) {
			console.log('quest', quest);
			console.log('rating', rating);
		};

		$scope.topOrder = function(quest) {
			var views = $scope.getViews(quest);
			var rating = $scope.getRating(quest) + 1;
			return -views*rating;
		};

		$scope.newOrder = function(quest) {
			return -quest.last_change || 0;
		};

		$scope.questOrder = function(quest) {
			return $scope.isActive('/top') ? $scope.topOrder(quest) : $scope.newOrder(quest);
		};

		$scope.questFilter = function(quest) {
			var uid = $scope.uid;
			var isOwner = $scope.authData ? $scope.authData.uid == uid : false;
			return isOwner ? !!(quest.uid == uid && quest.last_change) :
							   uid ? !!(quest.is_public && quest.uid == uid && quest.last_change) :
							   			 !!(quest.is_public && quest.last_change);
		};

		$scope.isMyQuest = function(quest) {
			return $scope.authData ? quest.uid == $scope.authData.uid : false;
		}

	}])
	.controller('playerController', ['$scope', '$routeParams', '$firebaseAuth', '$firebaseObject', '$location',
	function($scope, $routeParams, $firebaseAuth, $firebaseObject, $location) {
		var ref = new Firebase(FIREBASE_URL);
		var questsRef = ref.child('quests');
		var auth = $firebaseAuth(ref);
		$scope.authData = auth.$getAuth();
		$scope.isAuthorized = false;
		$scope.loaded = false;
		var savesRef = ref.child('saves');
		var viewsRef = ref.child('views');
		var ratingsRef = ref.child('ratings');

		if ($scope.authData) {
			$scope.isAuthorized = true;
		}

		if ($routeParams.id) {
			if ($scope.isAuthorized) {
				var savedNodeRef = savesRef.child($routeParams.id).child($scope.authData.uid);
				$scope.savedNode = $firebaseObject(savedNodeRef);
				var rateRef = ratingsRef.child($routeParams.id).child($scope.authData.uid);
				$scope.rate = $firebaseObject(rateRef);
			}
			var questViewsRef = viewsRef.child($routeParams.id);
			$scope.questViews = $firebaseObject(questViewsRef);
			var thisQuestRef = questsRef.child($routeParams.id);
			$scope.quest = $firebaseObject(thisQuestRef);
			$scope.quest.$loaded()
				.then(function() {
					$scope.loaded = true;
					$scope.nodeNumber = $scope.load();
					$scope.moveTo($scope.nodeNumber);
					/*if(!$scope.$$phase) {
						$scope.$apply();
					}*/
				})
		} else {
			alertify.alert('Quest not found');
		}

		$scope.load = function() {
			return $scope.isAuthorized ? $scope.savedNode.$value || 0 : 0;
		};

		$scope.moveTo = function(nodeNumber, errorNumber) {
			// If for some reason there is no node by this number,
			// viewer tries to repair quest by shifting to next node
			// maximum 10 times
			errorNumber = errorNumber || 10;
			if ($scope.savedNode) {
				$scope.savedNode.$value = nodeNumber;
				$scope.savedNode.$save();
			}

			$scope.node = $scope.quest.nodes[nodeNumber];
			if (!$scope.node || $scope.node.hide) {
				if (errorNumber > 0) {
					$scope.moveTo(nodeNumber + 1, errorNumber - 1);
				}
				return;
			}

			$scope.update();
		};

		$scope.hasImage = function(node) {
			return !!node && !!node.imagesrc;
		};

		$scope.update = function() {
			if(!$scope.$$phase) {
				$scope.$apply();
			}
		};

		$scope.restart = function() {
			$scope.moveTo(0);
		};

		$scope.saveAndQuit = function() {
			$location.path('/');
		};

		$scope.quit = function() {
			if ($scope.savedNode) {
				$scope.savedNode.$value = 0;
				$scope.savedNode.$save();
			}
			$location.path('/');
		};

		$scope.incrementViews = function() {
			if ($scope.questViews.$value) {
				$scope.questViews.$value += 1;
			} else {
				$scope.questViews.$value = 1;
			};
			$scope.questViews.$save();
		};

		$scope.finish = function() {
			$scope.loaded = false;
			$scope.isCongrats = true;
			$scope.incrementViews();
		};

		$scope.toggleRate = function(value) {
			$scope.rate.$value = value;
			$scope.rate.$save();
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
	})
	.directive('panels', function(){
    return {
      restrict: 'C',
      controller: function(){
        this.tab = 1;

        this.selectTab = function(setTab) {
          this.tab = setTab;
        };

        this.isSelected = function(checkTab) {
          return this.tab === checkTab;
        };
      },
      controllerAs: 'panels'
    };
  })
  .directive('img', function () {
    return {
      restrict: 'E',        
      link: function (scope, element, attrs) {
        element.error(function () {
          var url = 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Tvnews_visual_wikipetan.png';
          element.prop('src', url);
        });
      }
    }
  })
  .directive('starRater', function() {
		return {
			restrict : 'A',

			template : [
				'<ul class="rating" >',
			    '<li ng-repeat="star in stars" ng-class="star" ',
			    		'ng-click="toggle($index)" >',
			      '<i class="fa fa-star fa-lg"></i>',
			    '</li>',
			  '</ul>'
			].join(''),

			scope : {
			  rating : '=',
			  rate : '=',
			},

			link: function(scope, elem, attrs) {
				var updateStars = function() {
				  scope.stars = [];
				  for (var i = 0; i < 5; i++) {
				    scope.stars.push({
				      filled : i < scope.rating
				    });
				  }
				};

				updateStars();
				
				scope.toggle = function(index) {
				  scope.rate(index + 1);
				  updateStars();
				};

				scope.$watch(function() {
					return scope.rating;
				}, function() {
		    	updateStars();
			  });
			}
		};
	})
  .directive('starRating', function() {
		return {
			restrict : 'A',

			template : [
				'<ul class="rating" >',
			    '<li ng-repeat="star in stars" ng-class="star">',
			      '<i class="fa fa-star"></i>',
			    '</li>',
			  '</ul>'
			].join(''),

			scope : {
			  //rate : '=',
			  ratingsObject : '=',
			  quest: '='
			},

			link: function(scope, elem, attrs) {
				var updateStars = function() {
					var rating = 0;
					var ratingObject = scope.ratingsObject[scope.quest.$id];
					if (ratingObject) {
						var users = Object.keys(ratingObject);
						var i;
						var sum = 0;
						for (i = 0; i < users.length; i++) {
						  sum += ratingObject[users[i]];
						}
						rating = sum / i;
					}
				  scope.stars = [];
				  for (var i = 0; i < 5; i++) {
				    scope.stars.push({
				      filled : i < rating
				    });
				  }
				};

				updateStars();

				scope.$watch(function() {
					return scope.ratingsObject[scope.quest.$id];
				}, function() {
		    	updateStars();
			  });
			}
		};
	});

