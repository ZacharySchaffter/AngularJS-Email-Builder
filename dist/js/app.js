var app = angular.module('emailBuilderApp', ['ngAnimate', 'textAngular', 'ui.sortable']);



app.controller('emailBuildCtrl', function ($scope, $http, $location) {
	
	//Status initializes as 'blank'
	//Once a file is loaded 'working' and 'preview' toggle between editable and preview states
	$scope.status = {mode: "blank"};
	
	//Toggles between working and preview settings
	$scope.toggleEditingStatus = function(){
		if($scope.status.mode === "working") {
			$scope.status.mode = "preview";
		} else {
			$scope.status.mode = "working";	
		}
	};
	
	//get a list of the saved JSON files
	$scope.getFiles = function() {
		$http({
			url: "./php/getFiles.php",
			method: "GET"
		
		}).then(function(response){
			console.log(response.data);
			$scope.saveFiles = response.data;
		});
	};
	
	//Switches between save and load
	$scope.fileActionSwitch = function(action) {
		$scope.fileAction = action;	
	};
	//Sets filename to autofill the filename on file-select
	$scope.setFilename = function(name) {
		$scope.filename = name;
	};
	
	//Creates a new file by populating sections array
	$scope.createNew = function() {
		if (!$scope.file) {
			$scope.file = {
				'sections' : [],
				'week' :  $scope.getNearestMonday()
			
			};
			$scope.addSection(0, "story");
		} else {
			var confirmCreate = confirm("Create new document?  You'll lose unsaved changes on the current project.");
			 if (confirmCreate) {
				$scope.file = {'sections' : []};
				$scope.addSection(0, "story");
				 
			}
		
		}
		//Set status to working
		$scope.status.mode = "working";
		$scope.addUnloadEvent();
	};
	
	//Load the selected file
	$scope.loadFile = function() {
		var year = this.$parent.folder.year;
		var filename = this.file + ".txt";
		//add a query to prevent loadFile() from returning a cached version of the file
		var query = new Date().getTime();
		console.log("./saves/"+year+"/"+filename);
		$http({
			url: "./saves/"+year+"/"+filename+"?"+query,
			method: "GET",
		
		}).then(function(response){
			$scope.file = response.data;
			console.log(response.data);
			$scope.showFileSelect();
			$scope.status.mode = "working";
			$scope.addUnloadEvent();
		});
	};
	
	
	
	
	//Save the current file
	$scope.saveFile = function(filename, overwrite) {
		$http({
			url: "./php/saveFile.php",
			method: "POST",
			data: {
				'filename' : filename, 
				'data' : $scope.file, 
				'overwrite' : overwrite
			}
		
		}).then(function(response){
			if (response.data.error && response.data.fileExists) {
				$scope.confirmOverwrite = true;
				return;
			} else {
				console.log(response.data);
				$scope.showFileSelect();
				$scope.confirmOverwrite = false;
				$scope.removeUnloadEvent();	
			}
		});
		
	};
	
	
	//Toggle visibility of the file select window
	$scope.showFileSelect = function() {
		$scope.fileSelectShow = !$scope.fileSelectShow;	
	};
	
	
		
	//UI Sortable Functions
	
		/* Function that tracks scrolling.  It prevents a weird jQuery UI sortable bug that causes a jerky jump up the page when sorting lists taller than the window.  Removing this will cause the drag/drop sort function to jump around a bit, but won't break it. entirely*/ 
		var lastScrollPosition = 0;
		var tempScrollPosition = 0;
		
		window.onscroll = function () { 
			clearTimeout($.data(this, 'scrollTimer'));
			$.data(this, 'scrollTimer', setTimeout(function () {
				tempScrollPosition = lastScrollPosition; 
			}, 250));
			
			lastScrollPosition = $(document).scrollTop(); // Up to you requirement you may change it to another elemnet e.g $("#YourPanel").onscroll
		};
		
	//Sortable options	
	$scope.sortableOptions = {
		axis: 'y',
		delay: 150,
		opacity: 0.7,
		//placeholder: "sectionPlaceHolder",
		start: function(e, ui){
			//Bind the function to prevent the sorting from jumping around
			$(document).scrollTop(tempScrollPosition);	
				
			},
		stop: function(e, ui){
			
			}
		
	};
	
	//Quick function to check if user reeeeally wants to leave the page.  Added because Kristen kept losing unsaved changes.
	//Some people, amirite.
	$scope.addUnloadEvent = function(){
		console.log("adding event");
		if (window.addEventListener) {
		   window.addEventListener("beforeunload", handleUnloadEvent);
		} else {
		   //For IE browsers
		   window.attachEvent("onbeforeunload", handleUnloadEvent);
		}
	};
	
	function handleUnloadEvent(event) {
		event.returnValue = "Any unsaved changes will be lost.";
	   
	}
	
	$scope.removeUnloadEvent = function() {
	   if (window.removeEventListener) {
		   window.removeEventListener("beforeunload", $scope.handleUnloadEvent);
	   } else {
		   window.detachEvent("onbeforeunload", $scope.handleUnloadEvent);
	   }
	};
	
	//Function to add new sections to $scope.sections
	$scope.addSection = function(index, sectiontype) {
		var newSection = {
			"type"  : sectiontype,
			"title" : "",
		};
		
		if (sectiontype === "story") {
			newSection.date  = "";
			newSection.image = "./images/default/default.png";
			newSection.color = "#E5D9C4";
			newSection.text = "Type your text here!";
		}
		
		//Add new section to array at specified index;
		$scope.file.sections.splice(index+1, 0, newSection);
        //$scope.sections.push(newSection);
		
		
    };
	
	//Function to remove section
	$scope.remove = function($index){ 
  		$scope.file.sections.splice($index,1);     
	};
	
	
	//Send email
	$scope.sendDialog = false;
	$scope.showSendDialog = function() {
		$scope.sendDialog = true;
	};
	
	$scope.sendEmailError = "";
	
	$scope.sendEmail = function() {
		$http({
			url: "./php/sendEmail.php",
			method: "POST",
			data: {
				'recipient' : $scope.file.recipient, 
				'file' : $scope.file, 
				'subjectline' : $scope.file.subjectline
			}
		
		}).then(function(response){
			if (response.data.error) {
				$scope.sendEmailError = response.data.msg;
				console.log(response.data);
			
			} else {
				console.log(response.data);
				$scope.sendEmailError = "";
				$scope.sendDialog = false;
			}
					
			
		});
		
	};
	
	
	/*
	
	
	Functions for image-wrap
	
	
	*/
	
	//Function to show image-wrap
	$scope.imageDivVisible = false;
	
	$scope.showImageSelect = function(index) {
		//show image-wrap
		$scope.imageDivVisible = true;	
		//Console.log index you're attempting to change
		$scope.indexToChange = index;
		console.log("Showing image select, planning to change index", $scope.indexToChange);
	};
	
	//Function to hide image-wrap
	$scope.hideImageSelect = function() {
		$scope.imageDivVisible = false;	
		
	};
	
	//Function to change image
	//Clicking an image in the overlay will change [indexToChange]'s image property
	$scope.changeImage = function(img) {
		$scope.file.sections[$scope.indexToChange].image = img;	
		$scope.imageDivVisible = false;
	};
	
	
	//Auto populate "week of" text
	$scope.getNearestMonday = function() {
		var today = new Date();
		var day = today.getDay(); //get todays day in 0-6
		var offset = (day <= 1) ? 0 : 7; //if today is sunday, then the offset is 0, otherwise make it a week later
		
		
		var daysTillMonday = 1 + offset - day; //Monday (1) plus the offset, - whatever todays day is.
		var nextMonday = new Date(today.getTime());
		nextMonday.setDate(today.getDate()+daysTillMonday);
		 
		var monthNames = [
		  "Jan.", "Feb.", "March",
		  "April", "May", "June", "July",
		  "Aug.", "Sept.", "Oct.",
		  "Nov.", "Dec."
		];
		var mondaysMonth = nextMonday.getMonth();
		var month = monthNames[mondaysMonth];
		var dd = nextMonday.getDate();
		console.log(month, dd);
		return "The week of "+month+" "+dd;
		
		
		};
});



app.controller('imageCtrl', function ($scope, $http) {
	//get JSON file of images
	$scope.loadImages = function(){	
		$http({
			dataType: "json",
			url: "./php/getImages.php",
			method: "GET",
			
		}).then(function(response){
			console.log("Get Images:");
			console.log(response);
			$scope.images = response.data;
		});
		
		//show the addImage divs
		$scope.addNewImage = function(){
			$scope.imageWindow = "add";
		};
	
	};
	
	
	
	/*image creation object*/
	$scope.imgCreation = {
		img : "",
		imgTitle : "",
		imageFile : "",
		status: "uploading", //Initialize status of the image creation wizard.
		x : 250, //x-coordinate for img on canvas; starts halfway across canvas
		y : 150, //y-coordinate for img on canvas; starts halfway down canvas
		imgWidth : 0, //current width, for use in zoom function
		imgHeight : 0, //current height, for use in zoom function
		lastX : 0,
		lastY : 0,
		zoom : 100.0,
		canvasZoom : 1,
		isDragging : false,
		errors : false,
		errorMessage: ""
	};
	
	//function to change status/advance through wizard
	$scope.changeStatus = function(status) {
		if(status === "saving") {
			var previewCanvas = document.getElementById("previewCanvas");
			$scope.imgCreation.imageToSave = previewCanvas.toDataURL("image/png");
			$scope.imgCreation.status = status;
		} else {
			$scope.imgCreation.status = status;	
		}
	};
	
	//Drag and Drop. If .isAdvanceUpload evaluates as true, the upload wrap gets additional styling via ng-class
	$scope.isAdvancedUpload = (function() {
		var div = document.createElement('div');
		return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in 			window;
	})();
	
	//Angular doesn't like file inputs, so this function is necessary till that's fixed
	//fileNameChanged() calls 'loadFile' whenever the input[type="file"] changes
	$scope.fileNameChanged = function(el) {
		var file = el.files[0];
		$scope.loadFile(file);
	};
	
	//loadFile reads selected file and loads it to canvas
	$scope.loadFile = function(file) {
		$scope.imgCreation.imageFile = file;
		console.log("Trying to upload:", file.name);
		console.log("Data:", $scope.imgCreation.imageFile);
		
		//reset canvas variables in case user has loaded a second image during one session
		$scope.imgCreation.canvasZoom = 1;
		$scope.imgCreation.x = 400;
		$scope.imgCreation.y = 250;
		
		var imageType = /^image\//; 
		
		//Check to see if it's of the image type
		if (!imageType.test(file.type)) {	
			alert("That's not an image file! try again");
			$("#imageSelect").val("");
			return;
		} 
		
		$scope.imgCreation.img = new Image();
		var img = $scope.imgCreation.img; 
		
		$scope.tempimg = new Image();
		var tempimg = $scope.tempimg; 
				
		//Read loaded file, apply src and title
		var reader = new FileReader();
		reader.onload = (function(thisImg) {
			return function(e) {
				thisImg.src = e.target.result;
				thisImg.title = file.name.substring(0, file.name.indexOf('.'));
				
			};
		})(img);
		
		
		reader.readAsDataURL(file);
		
		//Once the image is loaded, add it to the thumbnail and load the canvas
		img.onload = function() {
			//set global img variable to this new image
			tempimg.src = img.src;
			tempimg.title = img.title;
			
			//Center x and y
			$scope.imgCreation.x -= (img.width/2);
			$scope.imgCreation.y -= (img.height/2);
			//reset img width and height
			$scope.imgCreation.imgWidth = img.width;
			$scope.imgCreation.imgHeight = img.height;
			
			//Initialize zoom to be 100%
			$scope.imgCreation.zoom = 100;
			$scope.imgCreation.canvasZoom = 1;
			
			//change status
			$scope.changeStatus("editing");
			$(".upload-icon").removeClass("fa-spinner fa-spin").addClass("fa-upload");
			$scope.$apply();
			
			//load new image to canvas
			$scope.loadCanvas();
			
		};
	};
	
	
	
	//loadCanvas loads the canvas and keeps it updated
	$scope.loadCanvas = function() {
		var img = $scope.imgCreation.img;
		var offsetX = $scope.imgCreation.x;
		var offsetY = $scope.imgCreation.y;
		var zoom = $scope.imgCreation.canvasZoom;
		
		
		var canvas = document.getElementById("myCanvas");
		var previewCanvas = document.getElementById("previewCanvas");
		
		
		if (!canvas) {
			return;
		}
		
		var ctx = canvas.getContext("2d");
		
		if (!$scope.imgCreation.img) {
			console.log("load an image to begin");		
			return;
		}
		
		//clear canvas
		ctx.clearRect(0,0,canvas.width, canvas.height);
		
		//background
		ctx.beginPath();
		ctx.rect(0,0, canvas.width, canvas.height);
		ctx.fillStyle = "#FFF";
		ctx.fill();
		
		//draw Image
		ctx.drawImage(img, offsetX, offsetY, img.width*zoom, img.height*zoom);
		
		//draw overlay
		ctx.beginPath();
		
			//outer rectangle
			ctx.moveTo(0,0);
			ctx.lineTo(0,0);
			ctx.lineTo(800,0);
			ctx.lineTo(800,500);
			ctx.lineTo(0,500);
			ctx.lineTo(0,0);
			ctx.closePath();
			
			//inner square (hole)
			ctx.moveTo(700,50);
			ctx.lineTo(100,50);
			ctx.lineTo(100,450);
			ctx.lineTo(700,450);
			ctx.lineTo(700,50);
			ctx.closePath();
			
			//fill overlay
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.fill();
			ctx.stroke();
		
		//Update the preview canvas as well
		var destCtx = previewCanvas.getContext("2d");
		destCtx.clearRect(0,0, previewCanvas.width, previewCanvas.height);
		destCtx.drawImage(canvas, -100, -50);
		

		
	};					  
		
	//zoomUpdate function, rewrites canvas when zoom changes
	$scope.zoomUpdate = function() {
		//update zoom variables.  toFixed makes sure the number has the tenths place.  
		//canvasZoom is just zoom/100, used on the loadCanvas function
		$scope.imgCreation.zoom = Number($scope.imgCreation.zoom).toFixed(1);
		$scope.imgCreation.canvasZoom = $scope.imgCreation.zoom/100;
		
		//Get the new x and y's based on the images new size
		var newWidth = $scope.imgCreation.img.width * $scope.imgCreation.canvasZoom;
		var newHeight = $scope.imgCreation.img.height * $scope.imgCreation.canvasZoom;
		$scope.imgCreation.x -= (newWidth - $scope.imgCreation.imgWidth)/2;
		$scope.imgCreation.y -= (newHeight - $scope.imgCreation.imgHeight)/2;
		
		//Reload canvas
		$scope.loadCanvas();
		
		//Set image's current width/height (dimension * current zoom level)
		$scope.imgCreation.imgWidth = $scope.imgCreation.img.width*$scope.imgCreation.canvasZoom;
		$scope.imgCreation.imgHeight = $scope.imgCreation.img.height*$scope.imgCreation.canvasZoom;
		
	};	
	
	//watch for zoom changes to call zoomUpdate
	$scope.$watch("imgCreation.zoom", function(newZoom, oldZoom) {
		$scope.zoomUpdate();
	});
	
	//Mousedown handler
	$scope.grabImage = function(e) {
		$scope.$apply(function(){
			$scope.imgCreation.lastX = e.clientX;
			$scope.imgCreation.lastY = e.clientY;
			$scope.isDragging = true;
			$(e.target).addClass("dragging-image");
			e.preventDefault();
		});
	};
	
	//Mousemove Handler
	$scope.dragImage = function(e) {
		if ($scope.isDragging) {
			$scope.$apply(function(){
				var diffX = e.clientX - $scope.imgCreation.lastX;
				var diffY = e.clientY - $scope.imgCreation.lastY;
				$scope.imgCreation.x += diffX;
				$scope.imgCreation.y += diffY;
				$scope.imgCreation.lastX = e.clientX;
				$scope.imgCreation.lastY = e.clientY;

				$scope.loadCanvas();
			});
		}
	};
	
	//Mouseup Handler
	$scope.releaseImage = function(e) {
		$scope.$apply(function(){
			$scope.isDragging = false;
			$(e.target).removeClass("dragging-image");
			$scope.imgCreation.lastX = 0;
			$scope.imgCreation.lastY = 0;
		});
	};
	
	//Scroll handler, calls zoomUpdate when you scroll atop the canvas.  Uses jquery-mousewheel plugin
	$scope.mouseWheelZoom = function(e){
		e.preventDefault();
		$scope.imgCreation.zoom = Number($scope.imgCreation.zoom);
		$scope.$apply(function(){
			if (e.deltaY>0 && $scope.imgCreation.zoom<=199.5) {
				$scope.imgCreation.zoom += 0.5;	
			} else if (e.deltaY<0 && $scope.imgCreation.zoom >= 1){
				$scope.imgCreation.zoom -= 0.5;	
			} else {
				console.log("Max zoom reached");	
			}
		});
	};
	
	
	//Save Image Function
	
	$scope.saveImage = function() {
		$http({
			url: "./php/saveImages.php",
			method: "POST",
			data: {image: $scope.imgCreation.imageToSave, filename: $scope.imgCreation.img.title}
			
		}).then(function(response){
			if (!response.data.error) {
				//successfully saved image: reload gallery
				$scope.imageWindow = "select";
				$scope.changeStatus("uploading");
				$scope.loadImages();
			} else {
				//display error: populate .error-messages with relevant text
				$scope.imgCreation.error = true;
				$scope.imgCreation.errorMessage = response.data["error-msg"];

			}
		});
	};
	
	//Delete image function
	$scope.deleteImg = function(imgToDelete) {
		console.log(imgToDelete);
		$http({
			url:"./php/deleteImages.php", 
			method: "POST",
			data: {filename:imgToDelete} 
		}).then(function(response){
			console.log(response);
			$scope.loadImages();
		});
	};
		
	
	
});

//Directive to allow drag and drop into the file upload window
app.directive('zImageDrop', ['$http', function($http) {
	return {
		restrict: 'EA',
		link: function(scope, el) {
			
			$(".upload-wrap").on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});	
			
			$(".upload-wrap").on('dragover', function() {
				$(this).addClass('is-dragover');
			});
			
			$(".upload-wrap").on('dragleave dragend drop', function() {
				$(this).removeClass('is-dragover');
			});
						
			$(".upload-wrap").on('drop', function(e) {
				 $(".upload-icon").removeClass("fa-upload").addClass("fa-spinner fa-spin");
				 if (e.originalEvent.dataTransfer){
        			if (e.originalEvent.dataTransfer.files.length > 0) {
						scope.loadFile(e.originalEvent.dataTransfer.files[0]);
        			}
    			}
				return false;
			});
		}	
	};
}]);

//Directive for dragging image on canvas, also the mousewheel scrolling
app.directive('zCanvasDrag', ['$http', function($http) {
	return {
		link: function(scope, attr, el) {
			//Assign handlers
			$("#"+el.id).mousedown(function(e){scope.grabImage(e);});
			$(document.body).mousemove(function(e){scope.dragImage(e);});
			$(document.body).mouseup(function(e){scope.releaseImage(e);});
			$("#myCanvas").on('mousewheel', function(e){scope.mouseWheelZoom(e);});
		}	
	};
}]);




app.directive('workingBanner', function() {
	return {
		templateUrl: "templates/working-banner.html"	
	};
});

app.directive('previewBanner', function() {
	return {
		templateUrl: "templates/preview-banner.html"
	};
});

app.directive('workingStory', function() {
	return {
		templateUrl: "templates/working-story.html"
	};
});

app.directive('previewStory', function() {
	return {
		templateUrl: "templates/preview-story.html"	
	};
});



