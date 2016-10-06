(function() {
	var des, inimages, getlanguage, successful_msg, submit, inform_disaster, images, cancel, disaster_type, click_to_get_location, contact_no, name, contact_no_validity_msg, drop_down_select_display, location_error_msg, disaster_error_msg, getlat, getlon, app, pointGeo, address, map, vectorLayer, selectedDis, data, vectorSource, gps_location;
	app = angular.module("incidentapp", ["ionic", "ngCordova", "ngStorage"]);
	app.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider.state("IncidentHome", {
			url: "/IncidentHome",
			templateUrl: "templates/IncidentHome.html"
		});
		$stateProvider.state("incident", {
			url: "/incident/:language",
			templateUrl: "templates/incident.html",
			controller: function($scope, $stateParams) {
				$scope.newlangID = $stateParams.language;
			}
		});
		$urlRouterProvider.otherwise("/IncidentHome");
	});

	app.controller("HomeController", function($scope, $http, $rootScope, $cordovaCamera, $ionicLoading, $localStorage, $cordovaFile, $ionicHistory, $cordovaFileTransfer, $cordovaNetwork) {
		$scope.language = "en";

		getlanguage = "en";


		$.ajax({
			url: "http://166.63.122.161:8000/api/v1/incidentlanguagetranslation/",
			dataType: "json",
			data: {
				'language': "en",
			},
			contentType: "application/json; charset=utf-8",
			success: function(result) {

				$scope.$apply(function() {
					$scope.incident_report_header = result.objects[0].incident_report_header;
					$scope.incident_report_quote = result.objects[0].incident_report_quote;
					$scope.inform_disaster = result.objects[0].inform_disaster;

				});
			},
			error: function() {
				console.log("error");
			}
		});

		$scope.goform = function() {
			window.location.href = "#incident";

		}


		var lan;
		$scope.showSelectValue = function(language) {
			console.log(language);
			getlanguage = "";
			getlanguage = language;

			$.ajax({
				url: "http://166.63.122.161:8000/api/v1/incidentlanguagetranslation/",
				dataType: "json",
				data: {
					'language': language,
				},
				contentType: "application/json; charset=utf-8",
				success: function(result) {
					$scope.$apply(function() {
						$scope.incident_report_header = result.objects[0].incident_report_header;
						$scope.incident_report_quote = result.objects[0].incident_report_quote;
						$scope.inform_disaster = result.objects[0].inform_disaster;


					});
				},
				error: function() {
					console.log("error");
				}
			});
		}

	});

	app.controller("IncidentController", function($scope, $http, $rootScope, $cordovaCamera, $ionicPopup, $ionicLoading, $localStorage, $cordovaFile, $ionicHistory, $cordovaFileTransfer, $cordovaNetwork) {

		$scope.formData = {};
		$scope.template = [];
		$scope.ready = false;

		$.ajax({
			url: "http://166.63.122.161:8000/api/v1/incidentlanguagetranslation/",
			dataType: "json",
			data: {
				'language': $scope.newlangID,
			},
			contentType: "application/json; charset=utf-8",
			success: function(result) {
				$scope.$apply(function() {

					$scope.description = result.objects[0].description;
					$scope.disaster_type = result.objects[0].disaster_type;
					$scope.drop_down_select_display = result.objects[0].drop_down_select_display;
					$scope.disaster_error_msg = result.objects[0].disaster_error_msg;
					$scope.location_error_msg = result.objects[0].location_error_msg;
					$scope.contact_no = result.objects[0].contact_no;
					$scope.name = result.objects[0].name;
					$scope.submit = result.objects[0].submit;
					$scope.contact_no_validity_msg = result.objects[0].contact_no_validity_msg;
					$scope.click_to_get_location = result.objects[0].click_to_get_location;
					$scope.successful_msg = result.objects[0].successful_msg;
					$scope.cancel = result.objects[0].cancel;
					$scope.inimages = result.objects[0].images;
					$scope.gps_location = result.objects[0].gps_location;
					$scope.inform_disaster = result.objects[0].inform_disaster;
					$scope.ok = result.objects[0].ok;
				});
			},
			error: function() {
				console.log("error");
			}
		});

		//get disaster Types
		$.ajax({
			url: "http://166.63.122.161:8000/api/v1/disaster/",
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			success: function(result) {
				$scope.$apply(function() {
					$scope.data = {
						list: result.objects,
						singleSelect: null
					};
					if ($scope.newlangID == "en") {
						$scope.setlang = "english";
					}
					else if ($scope.newlangID == "si") {
						$scope.setlang = "sinhala";
					}
					else {
						$scope.setlang = "tamil";
					}
				});
			},
			error: function() {
				console.log("error");
			}
		});

		//get images from Camera
		$scope.images = [];
		$scope.addImage = function(options) {
			var options = {
				destinationType: Camera.DestinationType.FILE_URI,
				sourceType: Camera.PictureSourceType.CAMERA,
				allowEdit: false,
				encodingType: Camera.EncodingType.JPEG,
				popoverOptions: CameraPopoverOptions,
				saveToPhotoAlbum: false
			};
			$cordovaCamera.getPicture(options)
				.then(function(imageData) {
					onImageSuccess(imageData);

					function onImageSuccess(fileURI) {
						createFileEntry(fileURI);
					}

					function createFileEntry(fileURI) {
						window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
					}

					function copyFile(fileEntry) {
						var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf("/") + 1);
						var newName = makeid() + name;
						window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
							fileEntry.copyTo(fileSystem2, newName, onCopySuccess, fail);
						}, fail);
					}

					function onCopySuccess(entry) {
						$scope.$apply(function() {
							var d = new Date();
							$scope.getcurrDate = d.getMilliseconds();
							$scope.images.push(entry.nativeURL);
							$scope.path = entry.nativeURL;
						});
					}

					function fail(error) {
						console.log("fail: " + error.code);
					}

					function makeid() {
						var text, possible, i;
						text = "";
						possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
						for (i = 0; i < 5; i++) {
							text += possible.charAt(Math.floor(Math.random() * possible.length));
						}
						return text;
					}
				}, function(err) {
					console.log(err);
				});
		};

		$scope.urlForImage = function(imageName) {
			var name = imageName.substr(imageName.lastIndexOf("/") + 1);
			var trueOrigin = cordova.file.dataDirectory + name;
			return trueOrigin;
		};

		//goback
		$scope.goback = function() {

			window.location.href = "#IncidentHome";
			window.location.reload();
		}

		//get photos from Gallery
		$scope.choosePhoto = function() {
			window.imagePicker.getPictures(function(results) {
				var i;
				for (i = 0; i < results.length; i++) {
					console.log("Image URI: " + results[i]);
					$scope.images.push(results[i]);
				}
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			}, function(error) {
				console.log("Error: " + error);
			}, {
				maximumImagesCount: 5
			});
		};
		$scope.click = function(index) {
			$scope.images.splice(index, 1);
		};

		//refreshmap when loading
		$rootScope.$on("$ionicView.afterEnter", function(scopes, states, ev) {
			$("#map_container")
				.empty();
			$("#map_container")
				.append('<div id="map" class="map" style="height:180px;width:100%;border:2px solid  #035b67;">' + "</div>");
			vectorSource = new ol.source.Vector({});
			pointGeo = new ol.geom.Point(ol.proj.transform([0, 0], "EPSG:4326", "EPSG:3857"));
			var iconFeature = new ol.Feature({
				geometry: pointGeo
			});
			vectorSource.addFeature(iconFeature);
			var iconStyle = new ol.style.Style({
				image: new ol.style.Icon({
					anchor: [.5, 46],
					anchorXUnits: "fraction",
					anchorYUnits: "pixels",
					opacity: .75,
					src: "img/marker.png"
				})
			});
			vectorLayer = new ol.layer.Vector({
				source: vectorSource,
				style: iconStyle
			});
			map = new ol.Map({
				target: "map",
				layers: [new ol.layer.Tile({
					source: new ol.source.OSM()
				}), vectorLayer],
				view: new ol.View({
					center: ol.proj.fromLonLat([80.7718, 7.8731]),
					zoom: 6
				})
			});

			//map onclick get address
			map.on("click", function(evt) {
				pointGeo.setCoordinates(evt.coordinate);
        getlat = "";
        getlon = "";
				var lonlat = ol.proj.transform(evt.coordinate, "EPSG:3857", "EPSG:4326");
				var lon = lonlat[0];
				var lat = lonlat[1];
				map_zoom_to_marker(lat, lon);
				var myobject = {
					latlng: lonlat[1] + "," + lonlat[0],
					sensor: true
				};

				getlat = lat;
				getlon = lon;
				$http.defaults.headers.post["Content-Type"] = "application/json";
				$http({
						method: "POST",
						url: "http://maps.googleapis.com/maps/api/geocode/json?http://maps.googleapis.com/maps/api/geocode/json",
						params: myobject,
						headers: {
							"Content-Type": "application/json "
						}
					})
					.success(function(data, status, headers, config) {
						address = null;
						address = data.results[0].formatted_address;
						var i, f;
						var splitresult = [];
						var checkresult = [];
						for (i = 0; i <= data.results[0].address_components.length - 1; i++) {
							for (f = 0; f <= data.results[0].address_components[i].types.length - 1; f++) {
								if (angular.equals(data.results[0].address_components[i].types[f], "administrative_area_level_2")) {
									$scope.resultDistrict = JSON.stringify(data.results[0].address_components[i].long_name);
									var removequotes = $scope.resultDistrict.split('"')
										.join("");
									$scope.getDistrict = removequotes;
									checkresult.push($scope.getDistrict);
								}
								if (angular.equals(data.results[0].address_components[i].types[f], "administrative_area_level_1")) {
									$scope.resultDistrict = JSON.stringify(data.results[0].address_components[i].long_name);
									var removespace = $scope.resultDistrict.split(" ")
										.join("");
									var removequotes = removespace.split('"')
										.join("");
									splitresult = removequotes.split("Province");
									$scope.getProvince = splitresult[0];
								}
							}
						}
						$scope.address = address;
					})
					.error(function(data, status, headers, config) {});
			});
		});

		//Function to get current GPS values
		function GpsFunction() {
			var onSuccess = function(position) {
				var myobject = {
					latlng: position.coords.latitude + "," + position.coords.longitude,
					sensor: true
				};
				getlat = "";
				getlon = "";
				getlat = position.coords.latitude;
				getlon = position.coords.longitude;
				var latlon = ol.proj.fromLonLat([getlon, getlat]);
				pointGeo.setCoordinates(latlon);
				//alert(getlat);
				map_zoom_to_marker(getlat, getlon);

				$http.defaults.headers.post["Content-Type"] = "application/json";

				$http({
						method: "POST",
						url: "http://maps.googleapis.com/maps/api/geocode/json",
						params: myobject,
						headers: {
							"Content-Type": "application/json "
						}
					})
					.success(function(data, status, headers, config) {
						address = null;
						address = data.results[0].formatted_address;
						var i, f;
						var splitresult = [];
						var checkresult = [];
						for (i = 0; i <= data.results[0].address_components.length - 1; i++) {
							for (f = 0; f <= data.results[0].address_components[i].types.length - 1; f++) {
								if (angular.equals(data.results[0].address_components[i].types[f], "administrative_area_level_2")) {
									$scope.resultDistrict = JSON.stringify(data.results[0].address_components[i].long_name);
									var removequotes = $scope.resultDistrict.split('"')
										.join("");
									$scope.getDistrict = removequotes;
									checkresult.push($scope.getDistrict);
								}
								if (angular.equals(data.results[0].address_components[i].types[f], "administrative_area_level_1")) {
									$scope.resultDistrict = JSON.stringify(data.results[0].address_components[i].long_name);
									var removespace = $scope.resultDistrict.split(" ")
										.join("");
									var removequotes = removespace.split('"')
										.join("");
									splitresult = removequotes.split("Province");
									$scope.getProvince = splitresult[0];
								}
							}
						}
						$scope.address = address;
					})
					.error(function(data, status, headers, config) {});
			};

			function onError(error) {
				console.log("code: " + error.code + "\n" + "message: " + error.message + "\n");
			}
			navigator.geolocation.getCurrentPosition(onSuccess, onError);
		}

		function map_zoom_to_marker(latitude, longitude) {
				map.getView()
					.setZoom(12);
				map.getView()
					.setCenter(ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'))
			}
			//check GPS enable or not
		$scope.gpsTest = function() {
			cordova.plugins.diagnostic.isGpsLocationAvailable(function(available) {
				console.log("GPS location is " + (available ? "available" : "not available"));
				if (!available) {
					cordova.plugins.diagnostic.switchToLocationSettings();
				}
				else {
					GpsFunction();
				}
			}, function(error) {
				console.error("The following error occurred: " + error);
			});
		};

		$scope.username = "";
		$scope.contactno = "";
		$scope.discription = "";
		$scope.data = {
			singleSelect: null,
			multipleSelect: [],
			option1: "option-1"
		};
		$scope.forceUnknownOption = function() {
			$scope.data.singleSelect = "";
		};

		//Generate CloseEnd Questions
		$scope.selectedDisaster = function(value) {
			var select = $scope.data.singleSelect;
			selectedDis = Number(select);
			$scope.accessselectedId = selectedDis;
			//alert(getlanguage);

			$http({
					method: "POST",
					url: "http://166.63.122.161:8000/incidents/select_questions/",
					dataType: "json",
					contentType: "application/json; charset=utf-8",
					data: JSON.stringify({
						disaster: $scope.data.singleSelect,
						language: getlanguage
					})
				})
				.success(function(data) {
					console.log("updated data ", data);
					$scope.formData = {};
					$scope.formTemplate = data;
					console.log(JSON.stringify(data));
				}), error(function(err) {
					console.log("error" + JSON.stringify(err));
				});
		};
		//save Incidents

		function showalertt() {
			var alertPopup = $ionicPopup.show({

				title: $scope.successful_msg,
				scope: $scope,
				template: '<center><div class="image"><img src="img/success.png" width="50" height="50" alt=""> </div></center>',
				buttons: [{
					text: $scope.ok,
					type: 'button-positive',
					onTap: function(e) {

					}
                }],
			});
		}
		$scope.sendfunction = function() {
			//progress bar
			$("#load")
				.show();

			$scope.date = new Date();
			$.ajax({
				url: "http://166.63.122.161:8000/api/v1/disaster/" + selectedDis + "/",
				contentType: "application/json; charset=utf-8",
				processData: false,
				dataType: "json",
				success: function(result) {



					var dis = {
						english: result.english,
						id: result.id,
						sinhala: result.sinhala,
						tamil: result.tamil
					};
					//alert($scope.date);
          console.log(getlat+"and"+getlon);
					data = JSON.stringify({
						address: $scope.address,
						contact_no: $scope.contactno,
						description: $scope.discription,
						latitude: parseFloat(getlat),
						longitude: parseFloat(getlon),
						name: $scope.username,
						disaster_type: result,
						reported_date: $scope.date,
						synced_date: $scope.date,
						district: $scope.getDistrict,
						province: $scope.getProvince,
						is_validated: false
					});

					$.ajax({
						url: "http://166.63.122.161:8000/api/v1/incident/",
						type: "POST",
						contentType: "application/json; charset=utf-8",
						data: data,
						processData: false,
						dataType: "json",
						success: function(result) {
							$scope.$apply(function() {
								console.log(result.id);
								$scope.resultid = result.id;
								$scope.distype = result.disaster_type.code;
								$scope.email_district = result.district;
								$scope.email_address = result.address;

								//  send email

								$.ajax({
									url: 'http://166.63.122.161:8000/incidents/send_mail_app/',
									type: 'POST',
									contentType: 'application/json; charset=utf-8',
									data: JSON.stringify({
										district: $scope.email_district,
										email_type: "incident_report",
										body_params: {
											'disaster_type': $scope.distype,
											'reported_date': $scope.date,
											'address': $scope.email_address,
										}
									}),
									dataType: 'json',
									success: function(result) {
										console.log(JSON.stringify(result));

									},
									error: function(err) {
										console.log(JSON.stringify(err)); //getAlbums();


									}
								})
								$("#load")
									.hide();
								showalertt();
								//alert($scope.successful_msg);

								if ($scope.images.length == 0) {
									$.ajax({
											method: 'POST',
											url: 'http://166.63.122.161:8000/incidents/save_app_qs/',
											dataType: "json",
											contentType: "application/json; charset=utf-8",
											data: JSON.stringify({
												'incident': $scope.resultid,
												'qs_list': $scope.formData
											})
										})
										.error(function(err) {
											//alert(JSON.stringify(err));
											window.location.reload();

										});



								}
								else {
									//alert("non");
									var i;
									for (i = 0; i <= $scope.images.length - 1; i++) {
										var options = {
											fileType: "jpg",
										};

										$cordovaFileTransfer.upload("http://demo.geoedge.lk/cfr/fileupload.php", $scope.images[i], options)
											.then(function(result) {
												$scope.temp = "";
												$scope.temp = result.response.substring(result.response.lastIndexOf('/') + 1, result.response.length - 2);

												data = JSON.stringify({
													"incident": "/api/v1/incident/" + $scope.resultid + "/",
													"name": $scope.temp,
												});

												//  alert(JSON.stringify(data));

												$.ajax({
													url: 'http://166.63.122.161:8000/api/v1/photo/',
													type: 'POST',
													contentType: 'application/json; charset=utf-8',
													data: data,
													dataType: 'json',
													success: function(result) {
														window.location.reload();

													},
													error: function(err) {
														//getAlbums();
														console.log(JSON.stringify(err));
														window.location.reload();




													}
												});

											}, function(err) {

											}, function(progress) {})
									}
									$.ajax({
											method: 'POST',
											url: 'http://166.63.122.161:8000/incidents/save_app_qs/',
											dataType: "json",
											contentType: "application/json; charset=utf-8",
											data: JSON.stringify({
												'incident': $scope.resultid,
												'qs_list': $scope.formData
											})
										})
										.error(function(err) {
											console.log(JSON.stringify(err));


										});
								}
							});


						},
						error: function(data) {
							console.log("error");
						}
					});
				},
				error: function(result) {
					console.log("error");
				}
			});
		};
		angular.extend($scope, {
			center: {
				lat: 39.92,
				lon: 116.38,
				zoom: 1
			}
		});
	});

	//block button submit
	$("#submit")
		.click(function() {
			$(this)
				.attr("disabled", "disabled");
		});

	//Bind closeEnd Questions
	app.directive("rnStepper", ["$document", "$compile", function($document, $compile) {

		return {
			restrict: "AE",
			scope: {
				formTemplate: "=template",
				formData: "=ngModel"
			},
			link: function($scope, element, attrs, ngCtrl) {
				$scope.$watch("formTemplate", function() {
					var form_content = angular.element(document.querySelector("rn-stepper"));
					var bracket = function(model, base) {
						props = model.split(".");
						return (base || props.shift()) + (props.length ? "['" + props.join("']['") + "']" : "");
					};
					form_content.empty();
					angular.forEach($scope.formTemplate, function(value, key) {
						var newDirective;
						if (value.type == "text") {
							newDirective = angular.element(
								"<div class='form-group' >" + "<label for='textArea' class='col-lg-2 control-label'>" + value.label + "</label>" + "<div class='col-lg-10'>" + "<input class='form-control' ng-model='" + value.model + "' type='text' />" + "</div>" + "</div>"
							);
							newDirective.find("input")
								.attr("ng-model", bracket(value.model, attrs.ngModel));
							element.append(newDirective);
							$compile(newDirective)($scope);
						}
						else if (value.type == "select") {

							element_string = "<div class='form-group' >" + "<label for='textArea' class='col-lg-2 control-label'>" + value.label + "</label>" + "<div class='col-lg-10'>" + "<select class='form-control' style='color:#000;' >" + "<option value=''>" + attrs.languageSelectDropdown.replace(/^'(.*)'$/, '$1');
							console.log("select ", value);
							angular.forEach(value.options, function(option) {
								element_string += "<option value='" + option.value + "'>" + option.label + "";
							});

							newDirective = angular.element(element_string);
							newDirective.find("select")
								.attr("ng-model", bracket(value.model, attrs.ngModel));
							element.append(newDirective);
							$compile(newDirective)($scope);
						}
						else if (value.type == "multiple_choices") {
							var element_string = "<div class='form-group' >" + '<label class="col-lg-6 control-label">' + value.label + "</label>" + '<div id="multiple_choices" class="col-lg-12 ">';
							var newDirective_form_el = angular.element(element_string);
							element.append(newDirective_form_el);
							var el_content = angular.element(document.querySelectorAll("#multiple_choices"));
							angular.forEach(value.options, function(option) {
								element_string = "<label class='col-md-6'><input type='checkbox' aria-label='' value=" + option.value + ">" + option.label + "";
								newDirective = angular.element(element_string);
								newDirective.find("input")
									.attr("ng-model", bracket(value.model + "." + option.value, attrs.ngModel));
								el_content.append(newDirective);
								$compile(newDirective)($scope);
							});
						}
						else if (value.type == "boolean") {
							var element_string = "<div class='form-group' >" + '<label for="textArea" class="col-lg-2 control-label">' + value.label + "</label>" + '<div id="boolean_choice" class="col-lg-10 ">';
							var newDirective_form_el = angular.element(element_string);
							element.append(newDirective_form_el);
							var boolean_choice = angular.element(document.querySelectorAll("#boolean_choice"));
							angular.forEach(value.options, function(option) {
								element_string = ' <div class="radio"><label class="">' + "<input type='radio' name=" + value.model + " aria-label='' value=" + option.label + ">" + option.label + "" + "</label>";
								newDirective = angular.element(element_string);
								boolean_choice.append(newDirective);
								console.log(angular.element(document.querySelectorAll("#boolean_choice")));
								newDirective.find("input")
									.attr("ng-model", bracket(value.model + "." + option.value, attrs.ngModel));
								$compile(newDirective)($scope);
							});
						}
					});
				});
			},
			controller: function($scope) {
				this.getData = $scope.formData;
			},
			controllerAs: "vm"
		};
    }]);

	app.run(function($ionicPlatform) {
		$ionicPlatform.ready(function() {
			if (window.cordova && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);
			}
			if (window.StatusBar) {
				StatusBar.styleDefault();
			}
			try {}
			catch (error) {
				console.log(error);
			}
		});
	});
})();
