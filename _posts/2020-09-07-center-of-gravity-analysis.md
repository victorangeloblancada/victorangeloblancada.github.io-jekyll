---
layout: post
title: "Center of Gravity Analysis in Python"
category: blog
tags: 
- logistics
- python
- combinations
- itertools
date: 2020-09-07
image: /assets/images/truck.jpg
dropcap: True
---

<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML">
</script>

In logistics, the center of gravity analysis is used to derive the ideal locations for warehousing facilities by calculating the transport costs to each of the locations to be served by the facility. The center of gravity is the location giving the lowest total transport costs.

From its name, it can be inferred that the center of gravity analysis is analogous to its physics and engineering counterpart where a single point where the weighted relative position of the distributed mass sums to zero, i.e. the center of mass or the balance point. The formula is similarly analogous with the logistics center of gravity calculated using transport volumes to and from the warehousing facility instead of distributed mass as in the physical center of mass. The formula for the coordinates of the physical center of mass or the logistics center of gravity is thus:

$$x = \frac{\sum_{i=1}^n m_i x_i }{\sum_{i=1}^n m_i}$$

$$y = \frac{\sum_{i=1}^n m_i y_i }{\sum_{i=1}^n m_i}$$

Where x and y refer to the coordinates of the n locations served (coordinates of the n distributed mass points for the physical center of mass) and m refers to the delivery volume (mass for the physical center of mass).

However, applying this theoretical analysis in practice rapidly becomes involved as realistic assumptions and business constraints are considered:

2. What if there needs to be more than one warehousing facility location?
2. What if the inbound and outbound shipping costs vary? This is a realistic assumption because of economies of scale since inbound delivery costs tend to be lower since items are shipped by bulk to the warehouse while they are shipped out to customers or distributors in smaller quantities. 
3. What if the business only have a few candidate locations where they can set up the facility?
4. How do we ensure that selected coordinates land on feasible sites for warehouse locations, e.g. the location is not in a residential area or on a mountain or on water?

For questions 1 & 2, let's look at how to use K-Means to get the centers of gravity. The following section includes code for implementing this in Python.

For questions 3 & 4, let's look at how to use Itertools in Python to select the centers of gravity from a set of candidate sites. The last section includes code for implementing this.

## Using K-Means for Multiple Facilities

Let's use the following dummy data to get the centers of gravity:

| Location Name  | Latitude | Longitude | Volume | Location Type |
| -------------- | -------- | --------- | ------ | ------------- |
| Manhattan,  NY | 40.7831  | -73.9712  | 5,000  | Demand        |
| New  Haven, CT | 41.2982  | -72.9991  | 1,000  | Demand        |
| Chicago,  Il   | 41.8333  | -88.0121  | 4,000  | Demand        |
| Raleigh,  NC   | 35.8436  | -78.7851  | 8,000  | Supply        |
| Nashville, TN  | 36.1863  | -87.0654  | 5,000  | Supply        |
| Boston, MA     | 42.3142  | -71.1103  | 3,000  | Demand        |

```python
%matplotlib inline
# Import libraries
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from itertools import combinations 

from sklearn.cluster import KMeans

import folium
from folium import plugins
from folium.plugins import HeatMap
```



![img](/assets/images/cog_1.PNG)



![img](/assets/images/cog_2.PNG)

## Using Itertools to Iterate Across Combinations of Sites



*Victor Blancada is a data scientist. Visit his LinkedIn page [here](https://www.linkedin.com/in/geloblancada/).* 