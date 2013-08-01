<?php
//generateRulesetXML.php
//
//This PHP script builds a Terify ruleset into an XML file for the user
//to download. Because it is meant for use with AJAX, it does not actually
//offer the file for download but merely save it to the server. Another
//PHP script, perhaps one invoked on the 'success' condition in an AJAX
//call, may offer the file to the user.
//
//This script assumes the ruleset has been passed in as a JSON string
//and uses the builtin json_decode function to unravel it. The XML
//document is built using the DOMDocument class.
//
//Christopher Anna 7/10/2013


//First, decode the ruleset. It has been passed to us as
//a JSON string from the Terify main page
$ruleset = json_decode($_POST['rules']);
print_r($ruleset);

//Extract all the properties of a rule object. We will use
//this later to iterate over.
$props = array_keys(get_object_vars($ruleset[0]));

//Instantiate the DOMDocument, which will be our XML tree.
$doc = new DOMDocument('1.0', 'ISO-8859-1');
$doc->formatOutput = true;

$comment = $doc->createComment('Created for Terify, a web-based T(ext) (V)erify tool. Copyright Christopher Anna 2013');
$doc->appendChild($comment);

//Each DOMDocument contains only one ruleset, so these
//statements are placed outside of the loop.
$root = $doc->createElement('ruleset');
$root = $doc->appendChild($root);

//For every rule in the ruleset, we make a new rule node.
//The rule node will have a child node for each rule property --
//key, delimiter, value, etc.
foreach ($ruleset as $rule) {
	$ruleNode = $doc->createElement('rule');
	$ruleNode = $root->appendChild($ruleNode);

	//Now you can see why we extracted all the properties the
	//rule object. We can iterate over the array very easily.
	foreach ($props as $property) {
		$propertyNode = $doc->createElement($property);
		$propertyNode = $ruleNode->appendChild($propertyNode);
		
		//PHP recognizes 'false' as an empty string. So instead of
		//having an empty node, we will write out the word 'false'
		//if the property is empty. This is relevant for the properties
		//ignoreCase and hasMatched.
		if (empty($rule->$property)) {
			$text = $doc->createTextNode("false");
		} else {
		//If the property is not empty, the text of the node should be
		//the value of the property.
			$text = $doc->createTextNode($rule->$property);
		}
		
		$text = $propertyNode->appendChild($text);
	}
}

//Open a new file to temporarily save the ruleset.
$filename = "ruleset.xml";
$fid = fopen("ruleset.xml", "w");

//Save the ruleset. This ruleset can be printed to screen
//when debugging by echo-ing '$doc->saveXML()' instead of
//wrapping it in an fwrite.
fwrite($fid, $doc->saveXML());

//Echo the filename back to the calling program so
//that it knows which file to request from the companion script
//downloadRuleset.php
echo $filename;

//Close the file. We're done!
fclose($f);
?>