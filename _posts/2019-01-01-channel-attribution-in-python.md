---
layout: post
title: "Channel Attribution in Python"
date: 2019-01-01
featured-img: https://cdn-image.travelandleisure.com/sites/default/files/styles/1600x1000/public/1511365953/times-square-new-york-city-TSHOTELADS1117.jpg
---

Attribution refers to the set of rules that determine which ad gets credit for a sale or a conversion. The rise of the Internet allowed marketers to track user interactions throughout the entire customer journey but most advertisers still attribute 100% of conversions to the last touch channel or the last ad that the user clicked before converting.

<!--break-->

To more accurately depict the contribution of each touchpoint to the conversion, a more mathematically robust method of attribution must be applied. One way is to use a Markov chain model to represent the possible customer journeys. Markov chains show the possible touchpoint transitions as probabilities based on the current touchpoint. Markov chains also make it easier to compute the probability of conversion from the start of the journey by summing the probabilities of conversion across all possible paths.

Sergey Bril discussed how to run data-driven attribution analysis using R on his website (https://analyzecore.com/2016/08/03/attribution-model-r-part-1/), but this article aims to implement data-driven attribution in Python without relying on specialized libraries. For illustrative purposes we will reuse the sample problem presented in Sergey Bril's original article. The sample Markov chain representing possible customer journeys is shown below:
 
![Markov Chain](https://i0.wp.com/analyzecore.com/wp-content/uploads/2016/07/Screenshot-2016-07-22-14.26.50.png)
 
Data-driven attribution is calculated by measuring the removal effect. The removal effect for a touchpoint is the decrease in conversion probability if the touchpoint is "removed" or if we assume that all users who visit the removed touchpoint will not convert.
 
![Removal Effect](https://i0.wp.com/analyzecore.com/wp-content/uploads/2016/07/Screenshot-2016-07-25-21.26.57.png)

The full notebook with Python code may be found on Colab [here](https://colab.research.google.com/drive/1m_SMStJUN0Q08eaNhIa0R2dkQS6HAewT).

Sources:
Anderl, E., Becker, I., Wangenheim, F. V., & Schumann, J. H. (2014). Mapping the customer journey: A graph-based framework for online attribution modeling. Available at SSRN: http://ssrn.com/abstract=2343077 or http://dx.doi.org/10.2139/ssrn.2343077
Bryl, S. (2018). Marketing Multi-Channel Attribution model with R (part 1: Markov chains concept) - AnalyzeCore by Sergey Bryl' - data is beautiful, data is a story. [online] AnalyzeCore by Sergey Bryl' - data is beautiful, data is a story. Available at: https://analyzecore.com/2016/08/03/attribution-model-r-part-1/ [Accessed 23 Oct. 2018].
