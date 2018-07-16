<?php
  //base image path
  $imageDirectory = "\/images\/";
  $baseImagePath = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]" . $imageDirectory;

?>