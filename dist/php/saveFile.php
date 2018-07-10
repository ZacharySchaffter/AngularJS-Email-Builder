<?php
	//Parse the JSON that angular passes...
	if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST))
		$_POST = json_decode(file_get_contents('php://input'), true);
	
	$results = [
		'error' => false,
		'fileExists' => false,
		'error-msg' => "No errors.",		
		'filename' => "",
			 
	];
	
	
	
	$fileName;
	$data;
	$overwrite;
	
	
	
	//If the filename isn't empty, and the image is set, set the variables, otherwise return errors and abort.
	if(!empty($_POST["filename"]) && !empty($_POST["data"])) { 
		$fileName = $_POST["filename"];
		$data = $_POST["data"];
		$overwrite = $_POST["overwrite"]; 
	} else if (empty($_POST["filename"])) {
		$results['error'] = true;
		$results['error-msg'] = "You need to type a filename.";
		die(json_encode($results));
	} else {
		$results['error'] = true;
		$results['error-msg'] = "Something went wrong.";
		die(json_encode($results));	
		
	};
	
	
	$year = date("Y");
	$baseSavesPath = "../saves/";
	$dir = $baseSavesPath.$year;
	$file = $baseSavesPath.$year."/".$fileName.".txt";
	
	//Check if the current year has a folder already.  If it doesn't it creates one.
	//Also check to make sure the filename doesn't exist in the directory, or if it does
	//that $overwrite has been passed as 'true'
	
	if(!is_dir($dir) && !file_exists($dir)) {
   		mkdir($dir);         
	} else if (file_exists($file) && !$overwrite) {
		$results["error"] = true;
		$results["fileExists"] = true;
		$results["error-msg"] = "That filename already exists.";
		
		die(json_encode($results));
	} 
	
	$fp = fopen( $file, 'wb' );
	fwrite( $fp, json_encode($data));
	fclose( $fp );
	
	$results["data"] = $data;
	$results["filename"] = $fileName;
	die(json_encode($results));
	
	
	


?>