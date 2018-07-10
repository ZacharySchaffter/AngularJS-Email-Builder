<?php

$baseFilesPath = "../saves/";

$filesArr = [];


	//loop over folder to grab subdirectories
	if ($handle = opendir($baseFilesPath)) {
		
		while (false !== ($file = readdir($handle))) {
			
			//Leave out the invisible files, thumbs.db, and the trash folder which is where deleted files go
			if( $file=="." || $file==".." || $file=="_notes" || $file=="Thumbs.db" || $file=="trash") continue;
			
			$subDir = strtolower($file);
			
			//create a subdirectory array that we add to the files array
			$subdirectoryArr = [];
			$subdirectoryArr["year"] = $subDir;
			$subdirectoryArr["files"] = [];
			
			//loop over each subdirectory to grab the filenames, and throw them into the arrays.files property
			if ($handle2 = opendir($baseFilesPath.$subDir."/")) {
		
				while (false !== ($file = readdir($handle2))) {
			
					if( $file=="." || $file==".." || $file=="_notes" || $file=="Thumbs.db" ) {
						continue;
					} 
					
					$file = substr($file, 0, strpos($file, "."));
					$subdirectoryArr["files"][] = $file;
					
				}
				closedir($handle2);
			}
			
			//add this subdirectoryArr to the imagesArray before looping again
			$filesArr[] = $subdirectoryArr;

			
		}
		closedir($handle);
	}
 	//The array is originally sorted based on filename, so it goes from oldest -> most recent.
	//This reorganizes it based on each array's folder property, thereby reversing it.
	usort($filesArr, function ($a, $b) { return $b['year'] > $a['year']; });;
	
	//echo the array as JSON for the other files to pick up.
	//header('Content-type: application/json');
	echo json_encode($filesArr);
?>