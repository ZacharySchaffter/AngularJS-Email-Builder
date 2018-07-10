<?php

$baseImagePath = "../images/";




//Make an empty images array, that we pass to JS as a JSON object later
//Chose an array so that when we iterate over the data it will always go sequentially
$imagesArr = [];


	//loop over images folder to grab subdirectories
	if ($handle = opendir($baseImagePath)) {
		
		while (false !== ($file = readdir($handle))) {
			
			//Leave out the invisible files, thumbs.db, and the trash folder which is where deleted images go
			//Added the default folder which can house the 'default' image for new sections
			if( $file=="." || $file==".." || $file=="_notes" || $file=="Thumbs.db" || $file=="trash" || $file=="default") continue;
			
			$subDir = strtolower($file);
			
			//create a subdirectory array that we add to the images array
			$subdirectoryArr = [];
			$subdirectoryArr["year"] = $subDir;
			$subdirectoryArr["images"] = [];
			
			//loop over each subdirectory to grab the img filenames, and throw them into the arrays.images property
			if ($handle2 = opendir($baseImagePath.$subDir."/")) {
		
				while (false !== ($file = readdir($handle2))) {
			
					if( $file=="." || $file==".." || $file=="_notes" || $file=="Thumbs.db" ) {
						continue;
					} else if (!strstr($file, ".png")) {
						continue;
					};
					
					$subdirectoryArr["images"][] = $file;
					
				}
				closedir($handle2);
			}
			
			//add this subdirectoryArr to the imagesArray before looping again
			$imagesArr[] = $subdirectoryArr;

			
		}
		closedir($handle);
	}
 	//The array is originally sorted based on filename, so it goes from oldest -> most recent.
	//This reorganizes it based on each array's folder property, thereby reversing it.
	usort($imagesArr, function ($a, $b) { return $b['year'] > $a['year']; });;
	
	//echo the array as JSON for the other files to pick up.
	//header('Content-type: application/json');
	echo json_encode($imagesArr);
?>