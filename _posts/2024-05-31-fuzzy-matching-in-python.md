---
layout: post
title: "Fuzzy Matching in Python"
category: blog
tags: 
- python
- data science
- data analysis
date: 2024-03-02
image: /assets/images/fuzzy.jpg
description: How to perform partial or fuzzy matching in Python.
dropcap: false
draft: false
---

*This is part of a series of short blog posts about automating repetitive work using Python.*

This is how to perform partial matching or fuzzy matching in Python using [TheFuzz library](https://github.com/seatgeek/thefuzz). This is useful for scenarios such as matching addresses written in different formats (e.g., New York vs NewYork vs New York City) or fixing typos in categorical data (e.g., Brusels can be matched to Brussels).

Start by importing process from TheFuzz:

```python
# Import fuzzy matching libraries
from thefuzz import process
```

Assuming you have two Pandas dataframes, df_1 and df_2, which you want to join on col_1 and col_2, respectively, you can run the following code to show matches from df_2 in df_1:

```python
# Create column of match result object. The extractOne function only returns the best match.
df_1['Fuzzy Match Result'] = df_1[col_1].apply(lambda x: process.extractOne(x, df_2[col_2]))
# Extract fuzzy matching string from result
df_1['Fuzzy Match'] = df_1['Fuzzy Match Result'].apply(lambda x: x[0])
# Extract fuzzy matching score
df_1['Fuzzy Match Score'] = df_1['Fuzzy Match Result'].apply(lambda x: x[1])
```

Here is the code as one big block:

```python
# Import fuzzy matching libraries
from thefuzz import process

# Load the two dataframes you want to fuzzy match
df_1 = pd.read_excel('file_1.xlsx')
df_2 = pd.read_excel('file_2.xlsx')

# The column name to match in df_1
col_1 = 'column'
# The column name to match in df_2
col_2 = 'column'

# Create column of match result object. The extractOne function only returns the best match.
df_1['Fuzzy Match Result'] = df_1[col_1].apply(lambda x: process.extractOne(x, df_2[col_2]))
# Extract fuzzy matching string from result
df_1['Fuzzy Match'] = df_1['Fuzzy Match Result'].apply(lambda x: x[0])
# Extract fuzzy matching score
df_1['Fuzzy Match Score'] = df_1['Fuzzy Match Result'].apply(lambda x: x[1])
```