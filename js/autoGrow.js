//This is a simple function for autogrowing a text area to accommodate
//the input text. It is copied directly from a tutorial, I believe from
//the Mozilla Developer's Network entry on textareas.
//Christopher Anna, 7/7/2013

function autoGrow(textarea) {
	if (textarea.scrollHeight > textarea.clientHeight) {
		textarea.style.height = textarea.scrollHeight + "px";
	}
	
	if (textarea.scrollWidth > textarea.clientWidth) {
		textarea.style.width = textarea.scrollWidth + "px";
	}
}