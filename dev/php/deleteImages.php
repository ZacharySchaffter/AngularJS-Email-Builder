<?php
	//Parse the JSON that angular passes...
	if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST))
		$_POST = json_decode(file_get_contents('php://input'), true);
	
	$baseImagePath = "../images";
	$trashedImagePath = "../images/trash";

	
	if( isset( $_POST["filename"]) == true ) { 
		$fileFolder = $_POST["filename"][0]; 
		$fileName = $_POST["filename"][1];
	};
	
	$file = $baseImagePath."/".$fileFolder."/".$fileName;
	
	
	$results = [
		'error' => false,
		'msg' => "Moved $fileName to the trash",		
		'file' => $file,
		'trash-file' => $trashedImagePath."/".$fileName
	];
	
	$delete = [];

	$date = date_create();
	$time = date_timestamp_get($date);
	
	if (file_exists($file) && copy($file, $trashedImagePath."/".$fileName."-".$time)) {
		//if file exists, and the copy attempt succeeds (appending current time to keep deleted files unique)
		
		$delete[] = $file;
	
	} else {
	//Otherwise return an error
		$results['error'] = true;
		$results['msg'] = "Something went wrong moving the file";
	};
	
	foreach ( $delete as $trashfile ) {
        unlink( $trashfile );
    }

	//echo the results as JSON

	echo json_encode($results);
?>

