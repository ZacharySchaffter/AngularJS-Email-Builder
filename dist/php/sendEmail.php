<?php
//Parse the JSON that angular passes...
if ($_SERVER['REQUEST_METHOD'] == 'POST' && empty($_POST))
	$_POST = json_decode(file_get_contents('php://input'), true);
		
//Directory to use for the images in the e-mail.  Change this if you ever migrate to a diff. server.
$imageDirectory = "development/applications/email-builder/images/";
$baseImagePath = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]/" . $imageDirectory;


$result = [
	"error" => false,
	"msg" => ""
];

$validEmail = filter_var($_POST["recipient"], FILTER_VALIDATE_EMAIL);

//If the data is passed successfully, put it in the $file variable.  Validate the e-mail too.
if(empty($_POST["recipient"])) { 
	$result["error"] = true;
	$result["msg"] = "You need to enter an E-mail Address"; 
	die(json_encode($result));

} else if (!$validEmail) { 
	$result["error"] = true;
	$result["msg"] = "You entered an invalid E-mail"; 
	die(json_encode($result));

} else if (empty($_POST["subjectline"])) {
	$result["error"] = true;
	$result["msg"] = "You need to enter a subject line"; 	
	die(json_encode($result));

}  else {
	$file = $_POST["file"];	
	$recipient = $_POST["recipient"];	
	$subjectline = $_POST["subjectline"];		
}

//email is the whole email
//email body are the sections from the app which are compiled and added the the email string

$email = file_get_contents('../templates/email-wrap.html');
$email = str_replace("{{week}}", $file["week"], $email); //replace the date bar with the active week 

$emailBody;
$storyTemplate = file_get_contents('../templates/email-story.html'); 
$bannerTemplate = file_get_contents('../templates/email-banner.html');

foreach($file["sections"] as $section) {
		//If it's a story, populate the template
		if ($section["type"] == "story") {
				$content = $storyTemplate;

				$content = str_replace("{{imageSource}}", $baseImagePath, $content);
				$content = str_replace("{{image}}", $section["image"], $content);
				$content = str_replace("{{title}}", $section["title"], $content);
				
				//Text can get screwy with blockquotes and paragraph tags, so remove them
				$text = $section["text"];
				$text = str_replace("<blockquote>","",$text);
				$text = str_replace("</blockquote>","",$text);
				
				$content = str_replace("{{text}}", $text, $content);
			
				if ($section["date"]) {
					$content = str_replace("{{date}}", $section["date"], $content);	
				} else {
					$content = str_replace("{{date}}", "", $content);		
				};
			
				if ($section["readmorebutton"]["active"]) {
					$buttonTemplate = file_get_contents('../templates/email-button.html'); 
					$content = str_replace("{{button}}", $buttonTemplate, $content);
					$content = str_replace("{{buttontext}}", $section["readmorebutton"]["text"], $content);	
					$content = str_replace("{{buttonlink}}", $section["readmorebutton"]["link"], $content);		
				} else {
					$content = str_replace("{{button}}", "", $content);
				
				};
			} else if ($section["type"] == "banner"){
				//Otherwise it's a banner, so do the same
				$content = $bannerTemplate;
				$content = str_replace("{{title}}", $section["title"], $content);
		};
		
		//Put $content into the email's body
		$emailBody .= $content;
	
	};

//add the compiled emailBody to the email
$email = str_replace("{{content}}", $emailBody, $email);


//Set some headers...
$headers  = 'MIME-Version: 1.0' . "\r\n";
//Chose utf-8 for accented character support.  
$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";

mail($recipient, $subjectline, stripslashes($email), $headers);

$result['email'] = $email;
die(json_encode($result));

	


?>