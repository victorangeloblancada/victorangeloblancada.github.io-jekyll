---
layout: post
title: "A Network Expansion Strategy Case Study"
date: 2017-11-16
featured-img: https://www.technobuffalo.com/wp-content/uploads/2013/08/internet-usage.jpg
---

In 2014, I was part of a six person team that developed a big data optimization to guide the $400MM USD fiber network infrastructure expansion project of a North American telecommunications company.

<!--break-->

The ubiquity and intangibility of the Internet makes it easy to forget that the information superhighway exists physically as a network of cables running beneath our cities and across oceans. This physical infrastructure is responsible for Internet access speed, with data sent over fiber optic cables being significantly faster than packets sent through the older (and currently more common) copper wires. The United States ranks behind countries such as South Korea because the American Internet infrastructure is still in the midst of transitioning to fiber Internet.

In 2014, I had the chance to help alleviate this problem when I worked on a fiber network expansion strategy project. The client, a regional North American telecommunications company, wanted to increase its market share by expanding their fiber network footprint and thereby winning new customers by offering fast Internet at competitive prices. The client set aside $400MM for the project, which was insufficient to expand the network across the entire country. They had to be selective about expansion.

Our firm was brought in to select markets for expansion in a way that will maximize profit. The client wanted to identify markets for expansion based on Metropolitan Statistical Areas or MSAs, which are geographical divisions defined by the Census Bureau based on core areas with high population density and close economic ties. While most strategists will conduct qualitative analyses on markets, our team decided that such a large investment would require validation only numbers could give.

We immediately identified the client ask as an optimization problem, roughly expressed in operations research terms as maximize profit as a function of customers gained multiplied by customer profit given a limited network budget, such that customers can only be gained if a network is built to their premises. Simply put, which customers should the client prioritize to maximize profits given that the cost of serving each customer differs and the budget is, as always, limited.

A third party data source, GeoResults, was used to gather data on telecommunications spending. The terabyte-scale data set contained 19 million rows of data on businesses across the United States, including business type, number of employees, industry, and most importantly, telecommunications spending subdivided by product (e.g. IDD, DS3, etc.). This was combined with the client's own customer database to create a single customer view covering all existing and potential business customers for our client.

Since the client wanted to maximize profit, it was necessary to come up with a projection of the KPI. The team created a predictive customer lifetime value (CLV) model that estimated the potential net profits from each customer as a function of projected telecommunications spending, multiplied by the probability of acquiring that customer based on client market presence and level of competition. Since not all customers are similar, the businesses were classified using the k-nearest neighbor algorithm based on client-specified customer segments before individual CLV models were generated for each segment.

Given the computational requirements of the undertaking, we ran the calculations in an Amazon EC2 instance.

While the CLV models provided estimates of expected profit, simply aggregating customer-level profit by market produced expansion recommendations in markets that were geographically distant, making the initial proposed network expansion inefficient. To take the geographical aspect of network construction costs into account, we had to take a spatial approach to the problem.

We used QGIS, an open-source geographical information system (GIS), to map out existing and potential customers, the client's existing network, and potential network expansion plans. QGIS can be thought of as Google Maps on steroids. It allows users to plot coordinate data as points or paths overlaid on maps of streets or terrain. More importantly, QGIS provides network and graph analysis functions out of the box - it is possible to compute for the shortest distance between points or even things such as minimum spanning trees. QGIS is written in C++ and Python. It is both extensible with C++ or Python plugins and includes an API that allows it to be controlled by third party programs and scripts. 

By expressing the network plan as a collection of nodes and edges with costs associated with growing each edge and node, we were able to programmatically quantify the network construction cost. This meant that finding the optimum fiber network plan is reduced to the simple matter of solving a mathematical optimization problem.

The final output we presented was a building-level network expansion map that specified exactly how the client should scale their network. 

There are a number of things that our model overlooked - for one thing, our approach did not take into account potential network effects by increased customer awareness of the client brand. Funnily enough, however, this was not what prevented our client's expansion from becoming the resounding success we had hoped it would be. Taking everyone by surprise, Google launched Google Fiber less than a year after we our final client presentation, and the first markets they served had considerable overlap with the markets we had suggested our client would expand to. Rerunning the analysis with this crucial piece of information, we would not have recommended those same markets because Google Fiber's presence meant that probability of acquiring new customers would now be considerably lower. This just proves that the model is always only as good as the data.
