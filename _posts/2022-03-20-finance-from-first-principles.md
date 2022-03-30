---
layout: post
title: "Finance from First Principles"
category: blog
tags: 
- blog
- math
- mathematics
- business
- finance
date: 2022-03-20
image: /assets/images/finance.jpg
dropcap: False
---

<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML">
</script>

As developers and data scientists rise in rank and expand their scope, finance becomes an unavoidable part of their responsibilities. This post is meant to serve as a reference of basic finance formulas with annotations designed to make the formulas easier to grok for engineers.

## Annual Time Value of Money

#### Future Value

<!--$$FV = PV (1+r)^n$$-->
` FV = PV(1+r)^n `

This just means that the future value of a present sum of money must be adjusted by the rate.

#### Present Value

<!--$$PV=\frac{FV}{(1+r)^n}$$-->
` PV = (FV)/(1+r)^n `

See future value above.

#### Rate

<!--$$r=(\frac{FV}{PV})^\frac{1}{n}−1$$-->
` r = ((FV)/(PV))^(1/n)-1 `

The rate can be calculated by getting the ratio of the future value compared to the present value then taking its nth root, where n is the number of compounding periods (usually in years).

#### Years

<!--$$n=\frac{log(\frac{FV}{PV})}{log(1+r)}$$-->
` n = (log((FV)/(PV))) / (log(1+r)) `

The number of years can be calculated by first getting the ratio of the future value compared to the present value. Based on the previous formulas, this ratio is equivalent to one plus the rate raised by the number of compounding periods.

` (1+r)^n=(FV)/(PV)` 

Take the logarithm of both sides with base (1+r).

###### ` n*log_(1+r)(1+r)=log_(1+r)((FV)/(PV))`

` log_(1+r)(1+r)` cancels out to one and n is now isolated on the left hand side. Use the logarithm change of base rule to evaluate the right hand side.

` n = (log((FV)/(PV))) / (log(1+r)) `

## Sub-Annual Time Value of Money

This section is almost exactly the same as the Annual Time Value of Money formulas except that the compounding periods are not strictly annual.

#### Future Value

<!--FV=PV(1+(rp))npFV=PV(1+(rp))np-->
` FV = PV(1+(r/p))^(np) `

#### Future Value with Continuous Compounding

` FV = PV*(e^(rn)) `

#### Present Value

` PV = (FV)/(1+(r/p))^(np) `

#### Stated Annual Rate

` r = p[((FV)/(PV))^(1/(np))-1] `

#### Period Rate

` r/p = ((FV)/(PV))^(1/(np))-1 `

#### Effective Annual Rate

` r_(effective) = (1+(r_(stated)/p))^p-1 `

#### Periods

` np = (log((FV)/(PV))) / (log(1+(r/p))) `

#### Years

` n = (log((FV)/(PV))) / (plog(1+(r/p))) `

## Constant Annuity/Perpetuity

#### Constant Perpetuity Present Value

` PV = (PMT)/r `

#### Constant Perpetuity Payment

` PMT = PV*r `

#### Constant Annuity Present Value

` PV = ((PMT)/r)*[1-(1/(1+r)^n)] `

*where n is the number of years of payments*

#### Sub-Annual Constant Annuity Present Value

` PV = ((PMT)/(r/p))*[1-(1/(1+(r/p))^(n*p))] `

*where n is the number of years of payments and p is the number of payments per year*

#### Constant Annuity Payment

` PMT = (PV*r)/[1-(1/(1+r)^n)] `

*where n is the number of years of payments*

#### Sub-Annual Constant Annuity Payment

` PMT = (PV(r/p))/[1-(1/(1+(r/p))^(np))] `

*where n is the number of years of payments and p is the number of payments per year*

## Growing Annuity/Perpetuity

#### Growing Perpetuity Present Value

` PV = (PMT)/(r-g) `

for r>g

#### Growing Perpetuity Payment

` PMT = PV*(r-g) `

for r>g

#### Growing Annuity Present Value

` PV = (PMT)/(r-g) * [1-((1+g)/(1+r))^n] `

for r>g

*where n is the number of years of payments*

#### Sub-Annual Growing Annuity Present Value

` PV = ((PMT)/(r/p-g/p))[1-((1+g/p)/(1+r/p))^(np)] `

for r>g

*where n is the number of years of payments and p is the number of payments per year*

#### Growing Annuity Payment

` PMT = (PV*(r-g)) / [1-((1+g)/(1+r))^n] `

for r>g

*where n is the number of years of payments*

#### Sub-Annual Growing Annuity Payment

` PMT = (PV(r/p-g/p))/[1-((1+g/p)/(1+r/p))^(np)] `

for r>g

*where n is the number of years of payments and p is the number of payments per year*

## Bonds

#### Present Value (Annual)

` PV = (FV)/(1+r)^n `

#### Present Value (Sub-Annual)

` PV = (FV)/(1+(r/p))^(np) `

#### Annuity Present Value (Annual)

` PV = ((PMT)/r) * [1-(1/(1+r)^n)] `

*where n is the number of years of payments*

#### Annuity Present Value (Sub-Annual)

` PV = ((PMT)/(r/p)) * [1-(1/(1+(r/p))^(np))] `

*where n is the number of years of payments and p is the number of payments per year*

## Net Present Value

#### Net Present Value

` NPV = FV_0 + ((FV_1)/(1+r)) + ((FV_2)/(1+r)^2) + ((FV_3)/(1+r)^3) + ... + ((FV_n)/(1+r)^n) `



<!--<script>
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
</form>-->