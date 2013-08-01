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
?>