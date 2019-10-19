function expand(id, focus_id){
	var element = document.getElementById(id);

	if (element.classList) { 
		element.classList.toggle("expand");
		if (element.classList.contains("expand")) {
			document.getElementById(focus_id).focus();
		} else {
			document.getElementById(id).focus();
			document.getElementById(id).blur();
		}
	} else {
		// For IE9
		var classes = element.className.split(" ");
		var i = classes.indexOf("expand");

		if (i >= 0) {
			classes.splice(i, 1);
			document.getElementById(id).focus();
			document.getElementById(id).blur();
		} else { 
			classes.push("expand");
			element.className = classes.join(" "); 
			document.getElementById(focus_id).focus();
		}
	}
}