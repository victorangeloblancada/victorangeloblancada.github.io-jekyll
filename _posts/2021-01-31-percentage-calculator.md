---
layout: post
title: "Percentage Calculator"
category: blog
tags: 
- blog
- math
- mathematics
- business
- percentage
- change
date: 2021-01-31
image: /assets/images/whiteboard.jpg
dropcap: False
---

After a brief debate at work on how to calculate percentage change, I've decided to build a very simple calculator to compare two values and give the assorted percentage relationshipes between them. Change numbers A and B below then press enter to show the percentage relationships.

<script>
	function calcPercent(a, b) {
		// The function displays text expressing the relation between two numbers as percentages
		if (isNaN(parseFloat(a))|isNaN(parseFloat(b))){
			document.getElementById('results').innerHTML = 'Please enter numeric values only'
		} else {
			document.getElementById('results').innerHTML = 'The following percentage relationships are true:'
			document.getElementById('results').innerHTML += '<p>'+a+' is '+100*parseFloat(a)/parseFloat(b)+'% of '+b+'.</p>'
			document.getElementById('results').innerHTML += '<p>'+b+' is '+100*parseFloat(b)/parseFloat(a)+'% of '+a+'.</p>'
			if (parseFloat(a)>parseFloat(b)) {
				document.getElementById('results').innerHTML += '<p>'+a+' is '+100*(parseFloat(a)-parseFloat(b))/parseFloat(b)+'% larger than '+b+'.</p>'
				document.getElementById('results').innerHTML += '<p>'+b+' is '+100*(parseFloat(a)-parseFloat(b))/parseFloat(a)+'% smaller than '+a+'.</p>'
			} else {
				document.getElementById('results').innerHTML += '<p>'+a+' is '+100*(parseFloat(b)-parseFloat(a))/parseFloat(b)+'% smaller than '+b+'.</p>'
				document.getElementById('results').innerHTML += '<p>'+b+' is '+100*(parseFloat(b)-parseFloat(a))/parseFloat(a)+'% larger than '+a+'.</p>'
			}
		}
	}
</script>

<form onload="calcPercent(document.getElementById('a').value, document.getElementById('b').value)">
	<p>Number A: <input type="text" id="a" value="10" onchange="calcPercent(document.getElementById('a').value, document.getElementById('b').value)"></p>
	<p>Number B: <input type="text" id="b" value="5" onchange="calcPercent(document.getElementById('a').value, document.getElementById('b').value)"></p>
	<div id="results">
		Results will show here 
	</div>
</form>