<?php
class TerifyRule {
	public $key;
	public $value;
	public $domain;
	public $delim;
	public $ignoreCase;
	public $hasMatched;
	
	function __construct($k, $v, $do, $de, $i, $h) {
		$this->key = $k;
		$this->value = $v;
		$this->domain = $do;
		$this->delim = $de;
		$this->ignoreCase = $i;
		$this->hasMatched = $h;
	}
}

$TerifyRuleset = array();

//Make sure the file exists
if ((!empty($_FILES['userfile'])) && ($_FILES['userfile']['error'] == 0)) {
	$filename = basename($_FILES['userfile']['name']);
	$ext = substr($filename, strrpos($filename, '.') + 1);

	//Make sure the file is of the correct type (using both application/xml and text/xml because of possible
	//differences in browser implementation
	if (($ext == 'xml') && ($_FILES['userfile']['type'] == 'application/xml' || $_FILES['userfile']['type'] == 'text/xml')) {
		$rulesetXML = simplexml_load_file($_FILES[$_POST['filename']]['tmp_name']);

		foreach($rulesetXML->rule as $r) {
			$h = new TerifyRule((string)$r->key, 
								(string)$r->value, 
								(string)$r->domain, 
								(string)$r->delim, 
								(string)$r->ignoreCase, 
								(string)$r->hasMatched);
			$TerifyRuleset[] = $h;
		}	

		echo json_encode($TerifyRuleset);
	} else { echo "Incorrect file type, please upload an XML file"; }
	
} else { echo "File not found"; }
?>