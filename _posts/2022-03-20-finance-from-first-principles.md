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
draft: True
---

As developers and data scientists rise in rank and expand their scope, finance becomes an unavoidable part of their responsibilities. This post is meant to serve as a reference of basic finance formulas with annotations designed to make the formulas easier to grok for engineers.

## Annual Time Value of Money

#### Future Value

FV=PV(1+r)nFV=PV(1+r)n

#### Present Value

PV=FV(1+r)nPV=FV(1+r)n

#### Rate

r=(FVPV)1n−1r=(FVPV)1n-1

#### Years

n=log(FVPV)log(1+r)

## Sub-Annual Time Value of Money

#### Future Value

FV=PV(1+(rp))npFV=PV(1+(rp))np

#### Future Value with Continuous Compounding

FV=PV⋅(ern)FV=PV⋅(ern)

#### Present Value

PV=FV(1+(rp))npPV=FV(1+(rp))np

#### Stated Annual Rate

r=p[(FVPV)1np−1]r=p[(FVPV)1np-1]

#### Period Rate

rp=(FVPV)1np−1rp=(FVPV)1np-1

#### Effective Annual Rate

reffective=(1+(rstatedp))p−1reffective=(1+(rstatedp))p-1

#### Periods

np=log(FVPV)log(1+(rp))np=log(FVPV)log(1+(rp))

## Constant Annuity/Perpetuity

#### Constant Perpetuity Present Value

PV=PMTrPV=PMTr

#### Constant Perpetuity Payment

PMT=PV⋅rPMT=PV⋅r

#### Constant Annuity Present Value

PV=(PMTr)⋅[1−(1(1+r)n)]PV=(PMTr)⋅[1-(1(1+r)n)]

*where n is the number of years of payments*

#### Sub-Annual Constant Annuity Present Value

PV=(PMTrp)⋅⎡⎣⎢1−⎛⎝⎜1(1+(rp))n⋅p⎞⎠⎟⎤⎦⎥PV=(PMTrp)⋅[1-(1(1+(rp))n⋅p)]

*where n is the number of years of payments and p is the number of payments per year*

#### Constant Annuity Payment

PMT=PV⋅r1−(1(1+r)n)PMT=PV⋅r1-(1(1+r)n)

*where n is the number of years of payments*

#### Sub-Annual Constant Annuity Payment

PMT=PV⋅(rp)1−(1(1+(rp))n⋅p)PMT=PV⋅(rp)1-(1(1+(rp))n⋅p)

*where n is the number of years of payments and p is the number of payments per year*

#### Years

n=log(FVPV)plog(1+(rp))

## Growing Annuity/Perpetuity

#### Growing Perpetuity Present Value

PV=PMTr−gPV=PMTr-g

for r>g

#### Growing Perpetuity Payment

PMT=PV⋅(r−g)PMT=PV⋅(r-g)

for r>g

#### Growing Annuity Present Value

PV=PMTr−g⋅[1−(1+g1+r)n]PV=PMTr-g⋅[1-(1+g1+r)n]

for r>g
*where n is the number of years of payments*

#### Sub-Annual Growing Annuity Present Value

PV=(PMTrp−gp)⋅[1−(1+gp1+rp)n⋅p]PV=(PMTrp-gp)⋅[1-(1+gp1+rp)n⋅p]

for r>g
*where n is the number of years of payments and p is the number of payments per year*

#### Growing Annuity Payment

PMT=PV⋅(r−g)1−(1+g1+r)nPMT=PV⋅(r-g)1-(1+g1+r)n

for r>g
*where n is the number of years of payments*

#### Sub-Annual Growing Annuity Payment

PMT=PV⋅(rp−gp)1−(1+gp1+rp)n⋅pPMT=PV⋅(rp-gp)1-(1+gp1+rp)n⋅p

for r>g
*where n is the number of years of payments and p is the number of payments per year*

## Bonds

#### Present Value (Annual)

PV=FV(1+r)nPV=FV(1+r)n

#### Present Value (Sub-Annual)

PV=FV(1+(rp))npPV=FV(1+(rp))np

#### Annuity Present Value (Annual)

PV=(PMTr)⋅[1−(1(1+r)n)]PV=(PMTr)⋅[1-(1(1+r)n)]

*where n is the number of years of payments*

#### Annuity Present Value (Sub-Annual)

PV=(PMTrp)⋅⎡⎣⎢1−⎛⎝⎜1(1+(rp))np⎞⎠⎟⎤⎦⎥PV=(PMTrp)⋅[1-(1(1+(rp))np)]

*where n is the number of years of payments and p is the number of payments per year*

## Net Present Value

#### Net Present Value

NPV=FV0+(FV11+r)+(FV2(1+r)2)+(FV3(1+r)3)+...+(FVn(1+r)n)



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