<?php
//downloadRuleset.php
//
//This PHP script is a companion to generateRulesetXML.php. It offers
//the file ruleset.xml, which was created by generateRulesetXML.php, to
//the user for download. The file MUST be named ruleset.xml.

$file = 'ruleset.xml';
header('Content-Description: File Transfer');
//header('Content-Type: application/octet-stream');
header('Content-Type: application/xml');
header('Content-Disposition: attachment; filename='.basename($file));
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($file));
ob_clean();
flush();
readfile($file);
?>