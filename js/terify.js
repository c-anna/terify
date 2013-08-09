//Terify (short for T(ext) (V)erify) is a tool for validating
//plaintext files against a user-defined ruleset made up of
//regular expressions. The functions in this file comprise the
//core engine of Terify, i.e., the pattern-matching and logic
//map for the tool. It makes use of the jQuery extension.
//Christopher Anna, 6/29/2013

var rules;
var text;
var failures;
var verboseText;
//ATTN FUTURE SELF
//HERE IS WHERE THE LIST OF PRELOADED DELIMITERS IS DEFINED			
var preloaded_delims = ['\\s+', '\\s*', '\\t+', '\\t*'];

//We will fill the array named 'failures' with Failure objects
//indicating the rule and line that failed. Later we will use
//this array to generate a report of how the text failed the ruleset.
function Failure (rule, line) {
	this.rule = rule;
	this.line = line;
}

//Overriding the toString function so that it provides useful
//information for the object
Failure.prototype.toString = function FailuretoString() { 
	return "Line " + this.line + " failed Rule #" + (this.rule + 1); 
}
	
function collectInputs(textarea,table) {
	//collectInputs simply scrapes all of the user-input rule data
	//off of the HTML form and into JS variables.
	
	text = new Array();
	rules = new Array();
	
	//This function will be used to test if a rule has been matched
	//by a line. Though it is simple, it is beneficial to write it
	//out so it can be easily passed in to the Array.every() method
	passed = function(element) {
		return element.hasMatched;
	}

	var text_raw = textarea.value.split("\n");
	for (var i = 0; i < text_raw.length; i++) //This loop simply shifts each i-th element of text_raw to the (i+1)-th element of text
		text[i+1] = text_raw[i] //This shifting is done to avoid confusion with line 0
								//From now on, the array 'text' starts at index 1, not 0!
	
	var inputs = table.rows; //This variable contains all of the 'row' objects of the HTML table. Each row is a rule
	
	for (var i = 0; i < inputs.length; i++) {
		var rule_pieces = inputs[i].getElementsByTagName("input");
		
		for (var j = 0; j < rule_pieces.length; j++) {
			rule_pieces[rule_pieces[j].name] = rule_pieces[j];
		}

		if (rule_pieces["key"].value == "" && rule_pieces["value"].value == "") {
			continue;
		} 
		
		rules[i] = {key:rule_pieces["key"].value, value:rule_pieces["value"].value}
		
	//Here we switch out the line '0' for the string 'any' so there is less confusion when
	//matching the first line of the text. This line will be line #0 according to Javascript
	//but line #1 according to the user.
		rules[i]["domain"] = rule_pieces["domain"].value == 0 ? 'any' : rule_pieces["domain"].value
		
	//Here we read the dropdown menu for delimiter and then read the custom input field if necessary
		rule_pieces["delim"] = inputs[i].getElementsByTagName('select')[0];
		
		
		if (rule_pieces["delim"].value == "Custom") {
			rule_pieces["delim"] = inputs[i].getElementsByClassName('delim_custom_text')[0];
		}

	//Here we replace a blank delimiter field with the regex /\s+/, which matches any nonzero 
	//number of whitespace characters. It seems like a reasonable default.
		rules[i]["delim"] = rule_pieces["delim"].value == "" ? '\\s+' : rule_pieces["delim"].value
		rules[i]["ignoreCase"] = rule_pieces["ignoreCase"].checked;
	
	//We will set a property of the rule object to signify whether or not
	//it has been matched by any lines. It will be initialized to 'false'
	//and then set to 'true' when it gets matched. This will be used for
	//'any'=domain lines 
		rules[i]["hasMatched"] = false;
	}
}
	
function terify() {
	failures = new Array();
	verboseText = new Array();
	
	for (var i = 1; i < text.length; i++) { //Remember, the array 'text' begins with 1, not 0.
											//We shifted the values to avoid line 0 confusion.
		for (var j = 0; j < rules.length; j++) {
			var ruleNum = j + 1
		//Before we get into testing whether the current line matches the rule,
		//we need to see if we should even consider this line for matching. The domain
		//However, we obviously shouldn't attempt to match the line if the key isn't even
		//correct. So we make a new regexp object with just the key and the delimiter and
		//run a test on the line using that object. If this test is positive, we will later
		//consider the line as a candidate for matching the full key-delimiter-value triplet.
			var keyExp;
			var keyTest = false;
			if (rules[j]["domain"] == 'any') {
						
				if (!rules[j]["ignoreCase"]) {
					keyExp = new RegExp(rules[j]["key"] + rules[j]["delim"], 'i');
				} else {
					keyExp = new RegExp(rules[j]["key"] + rules[j]["delim"]);
				}
			
				keyTest = keyExp.test(text[i]);
				if (keyTest) {
					verboseText.push("Rule #" + ruleNum + ": Line " + i + " matches the key and will be a candidate for matching the value.");
					//console.log("Line " + i + " matches the key and will be a candidate for matching the value.");
				} else {
					verboseText.push("Rule #" + ruleNum + ": Line " + i + " does not match the key and will not be considered for matching the value.");
					//console.log("Line " + i + " does not match the key and will not be considered for matching the value.");
				}
				
			}
			
		//Here we do a test of the full rule against the current line. We do the test if
		//the rule's domain exactly matches the current line, or if the domain is 'any' and the
		//keyTest is true. It would be sufficient to leave the second half of the 'OR' logic
		//as simply 'keyTest' but I thought it would add clarity to show both the domain
		//matching 'any' and the keyTest matching true.
			if (i == rules[j]["domain"] || (rules[j]["domain"] == 'any' && keyTest)) {
				var bigExp;			
				
				if (!rules[j]["ignoreCase"]) {
					bigExp = new RegExp(rules[j]["key"] + rules[j]["delim"] + rules[j]["value"], 'i')
				} else {
					bigExp = new RegExp(rules[j]["key"] + rules[j]["delim"] + rules[j]["value"])
				}
				
				var bigTest = bigExp.test(text[i]);
				if (bigTest) {
					verboseText.push("Rule #" + ruleNum + ": Line " + i + " matches the rule.");
					//console.log("Line " + i + " matches the rule.");
					rules[j]["hasMatched"] = true;
					rules[j]["lineOfInterest"] = i;
				} else {
					verboseText.push("Rule #" + ruleNum + ": Line " + i + " does not match the rule.");
					//console.log("Line " + i + " does not match the rule.");
					failures.push(new Failure(j,i));
				}					
			}
		}
	}
	
	//The second condition on the 'if' block makes sure that ALL rules have been matched
	//at least once. We want all rules to have matched at least one line before declaring
	//all rules to be satisfied.
	if (failures.length == 0 && rules.every(passed)) {
		//If we have no failures, then the text is verified and everything is happy
		$("#text_in").css("border-color", "#47d147"); //Green border
	} else if (failures.length == 0 && !rules.every(passed)) {
		//If not every rule has passed, but the length of the 'failures' array is 0,
		//it means some rules weren't tried for matching. For example, a rule is set for
		//line 10 but only 9 lines of input exist.
		$("#text_in").css("border-color", "#ff1919"); //Red border
	} else {
		//If we get to this block, it means all rules were tried for matching but did
		//not match any lines. That means there must be errors in the text.
		$("#text_in").css("border-color", "#ff1919"); //Red border
	}
	
}
	
function addNewRule(table) {
	var row = table.insertRow(-1);
	
	var x = row.insertCell(-1);
	x.innerHTML = 'Line # <input type="text" name="domain" maxlength=1 pattern="\\d" style="width:22px;">';
	x.className = 'domain';
	
	var x = row.insertCell(-1);
	x.innerHTML = 'Key: <input type="text" name="key">';
	x.className = 'key';
	
	var x = row.insertCell(-1);
	x.innerHTML = '<td>Delimiter: \
			<select name="delim_dropdown" onChange="showCustomDelim(this,this.parentNode.parentNode.children[3].children[0]);"> \
				<option title="Any nonzero number of whitespace characters" value="\\s+">\\s+</option> \
				<option title="Any number of whitespace characters (including zero)" value="\\s*">\\s*</option> \
				<option title="Any nonzero number of tab characters" value="\\t+">\\t+</option> \
				<option title="Any number of tab characters (including zero)" value="\\t*">\\t*</option> \
				<option class=custom value="Custom">Custom</option></td> \
			</select>';
	x.className = 'delim';
	
	var x = row.insertCell(-1)
	x.innerHTML = '<input type="text" disabled=true class=delim_custom_text>';
	x.className = 'delim_custom';
	
	var x = row.insertCell(-1)
	x.innerHTML = 'Value: <input type="text" name="value">';
	x.className = 'value';
	
	var x = row.insertCell(-1)
	x.innerHTML = 'Case sensitive? <input type="checkbox" name="ignoreCase">';
	x.className = 'ignoreCase';
}

function showCustomDelim(select, custom_field) {
	if (select.value == "Custom") {
		custom_field.disabled = false;
		custom_field.style.background = 'white';
		custom_field.style.opacity = 1.0;
	} else {
		custom_field.disabled = true;
		custom_field.style.background = 'gray';
		custom_field.style.opacity = 0.6;
		custom_field.value = '';
	}
}

function showReport(verbose) {	
	//This function creates and shows a report for the Terification of the text in the
	//textbox. It uses the 'global' variable failures.
	
	//We want to have one report area no matter how many times the 'Terify!' button
	//has been pressed. To do this, we'll need to empty the report area if it exists,
	//or create it if it doesn't exist.
	if ( $('#reportArea').length ) {
		while ($('#reportArea')[0].hasChildNodes()) {
			$('#reportArea')[0].removeChild($('#reportArea')[0].lastChild);
		}
	} else {
		var reportArea = document.createElement("div");
		reportArea.id = 'reportArea';
		document.body.appendChild(reportArea);
	}
	
	reportArea = $('#reportArea')[0];
	
	//Create a horizontal rule to separate the report area from the
	//input area
	reportArea.appendChild(document.createElement("hr"));
	
	//Write a header for the report area
	reportArea.appendChild(document.createElement("h2"));
	reportArea.lastChild.appendChild(document.createTextNode("Error Report"));
	
	//If the user clicked the "Verbose Output" button, show them all of the
	//verbose text
	if (verbose) {
		reportArea.appendChild(document.createElement("h3"));
		reportArea.lastChild.appendChild(document.createTextNode("Verbose Output"));
		
		for (var i=0; i < verboseText.length; i++) {			
			var verboseSnippet = (document.createElement("p")).appendChild(document.createTextNode(verboseText[i]));
			reportArea.appendChild(verboseSnippet);
			reportArea.appendChild(document.createElement("br"));
		}
		
		reportArea.appendChild(document.createElement("hr"));
		reportArea.appendChild(document.createElement("h3"));
		reportArea.lastChild.appendChild(document.createTextNode("Summary"));
	}
	
	//If there are no failures, write a success message in the report area
	if (failures.length == 0 && rules.every(passed)) {
		var congrats = (document.createElement("p")).appendChild(document.createTextNode("Congratulations! Your text has no errors!"));
		reportArea.appendChild(congrats);
	
	} else if (failures.length == 0 && !rules.every(passed)) {
		var unmatched = (document.createElement("p")).appendChild(document.createTextNode("Not all rules were tried for matching. The following rules were untested:"));
		reportArea.appendChild(unmatched);
		reportArea.appendChild(document.createElement("br"));
		
		for (var i=0; i < rules.length; i++) {
			if (rules[i].hasMatched == false) {
				var ruleNum = i + 1;
				var lonelyRule = (document.createElement("p")).appendChild(document.createTextNode("Rule " + ruleNum));
				reportArea.appendChild(lonelyRule);
				reportArea.appendChild(document.createElement("br"));
			}
		}
	} else {	
		//If there ARE failures, write each one to a new <p> in the report area
		for (var i=0; i < failures.length; i++) {			
			failure = (document.createElement("p")).appendChild(document.createTextNode(failures[i].toString()));
			reportArea.appendChild(failure);
			reportArea.appendChild(document.createElement("br"));
		}
	}

}

function fillRuleset(data) {
	//This function fills the ruleset table with a ruleset object that has been imported
	//by the user. This function is called upon the success of an AJAX query to importRulesetXML.php
	
	//console.log(data); //DEBUG
	//importRulesetXML returns a ruleset as a JSON object, so we'll parse it before
	//we do anything else
	importedRuleset = JSON.parse(data);						
	
	//First we remove any existing rules from the table by deleting all the rows in #ruleset_table
	var nrows = $("#ruleset_table")[0].rows.length;
	while (nrows > 0) {
		$("#ruleset_table")[0].deleteRow(-1);
		nrows = $("#ruleset_table")[0].rows.length;
	}
	
	//Now we will fill the ruleset_table back up with all the rules imported
	//by the user
	for (var i = 0; i < importedRuleset.length; i++) {
	
		//First, simply a new rule to the table. See the comments for addNewRule()
		addNewRule($("#ruleset_table")[0]);
		//console.log("rule = ", i);
		
		//Fill in each cell's value
		for (element in importedRuleset[i]) {
			if (element == 'hasMatched') {
				continue; //We can't do anything with the hasMatched property at this point
			}
			
			//Each cell is classed to its element type. This will make it easier to place the
			//value in the correct cell
			var currentClass = ".".concat(element);
			
			//However, there are of course special cases. First we handle custom delimiters. If
			//the delimiter passed back is not in the preloaded_delims array, we need to set the
			//dropdown menu to 'Custom' and set the delim_custom_text field to the delimiter. We
			//then call showCustomDelim to flip the style on the delim_custom_text field so it
			//appears visible and editable
			if (element == 'delim' && $.inArray(importedRuleset[i][element], preloaded_delims) == -1) {
				$(currentClass)[i].childNodes[1].value = 'Custom';
				$('.delim_custom_text')[i].value = importedRuleset[i][element];
				//console.log(importedRuleset[i][element]); //DEBUG
				showCustomDelim($('.delim')[i].childNodes[1], $('.delim_custom_text')[i]);
				
			//The next special case occurs when the domain of a rule is 'any'. This simply means that
			//the Line# field is left blank
			} else if (element == 'domain' && importedRuleset[i][element] == 'any') {
				$(currentClass)[i].childNodes[1].value = '';
				
			//The last special case occurs when the 'ignoreCase' property is 'true'. Instead of
			//changing the 'value' attribute, we need to change the 'checked' attribute. When this
			//property is 'false', we pass by this special case and set the property 'value' to 'false'.
			//This has no effect on the checkbox, which works just fine.
			} else if (element == 'ignoreCase' && importedRuleset[i][element] == '1') {
				$(currentClass)[i].childNodes[1].checked = true;
				
			//Finally, if we do not encounter any special cases, simply set the cell's input field 
			//value to the value of the element.
			} else {						
				$(currentClass)[i].childNodes[1].value = importedRuleset[i][element];
			}
		}
	}
}