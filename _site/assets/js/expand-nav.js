function expand(id){
	var element = document.getElementById(id);

	if (element.classList) { 
		element.classList.toggle("expand");
	} else {
		// For IE9
		var classes = element.className.split(" ");
		var i = classes.indexOf("expand");

		if (i >= 0) 
			classes.splice(i, 1);
		else 
			classes.push("expand");
			element.className = classes.join(" "); 
	}
}