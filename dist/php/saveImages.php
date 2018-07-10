<?php
	//Parse the JSON that angular passes...
	if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST))
		$_POST = json_decode(file_get_contents('php://input'), true);
	
	$results = [
		'error' => false,
		'error-msg' => "No errors.",		
		'file' => "",
		'filename' => "",
		 
	];
	
	$fileName;
	$imgData;
	//If the filename isn't empty, and the image is set, set the variables, otherwise return errors and abort.
	if(!empty($_POST["filename"]) && !empty($_POST["image"]) ) { 
		$fileName = $_POST["filename"]; 
		$imgdata = $_POST["image"];
		$results["filename"] = $fileName;
	} else if (empty($_POST["filename"])) {
		$results['error'] = true;
		$results['error-msg'] = "You need to type a filename.";
		die(json_encode($results));
	} else {
		$results['error'] = true;
		$results['error-msg'] = "You need to actually save an image?";
		die(json_encode($results));
	};
	
	$year = date("Y");
	$baseImagePath = "../images/";
	$dir = $baseImagePath.$year;
	$file = $baseImagePath.$year."/".$fileName.".png";
	
	//Check if the current year has a folder already.  If it doesn't it creates one.
	//Also check to make sure the filename doesn't exist in the directory
	
	if(!is_dir($dir) && !file_exists($dir)) {
   		mkdir($dir);         
	} else if (file_exists($file)) {
		$results["error"] = true;
		$results["error-msg"] = "That filename already exists.";
		die(json_encode($results));
	}
	
	
	//grab the data
	$filteredData=substr($imgdata, strpos($imgdata, ",")+1);
	
	$unencodedData=base64_decode($filteredData);
	
	
	$fp = fopen( $file, 'wb' );
    fwrite( $fp, $unencodedData);
    fclose( $fp );
	
	
	$results["file"] = $file;
	$results["filename"] = $fileName;
	die(json_encode($results));
	
	
	


?>