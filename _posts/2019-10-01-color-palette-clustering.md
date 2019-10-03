---
layout: post
title: "Color Palettes Using K-Means Clustering"
category: blog
tags: color palette image processing kmeans clustering
date: 2019-10-01
featured-img: /assets/images/color-palette.jpg
dropcap: true
---

K-means clustering is an unsupervised learning technique that groups individual data points by identifying centroids such that each individual data point is assigned a cluster based on which centroid is closest to it in n-dimensional space. The goal of K-means clustering is to find the set of *K* centroids such that the difference between individual data points within a cluster is minimized. The cluster centroids therefore serve as the "prototype" of the cluster.

To illustrate this principle, we will apply K-means clustering to pixel data from an image. Every pixel will be treated as an individual data point with RGB data. By applying K-means clustering on the RGB values of image pixels, the algorithm will determine the cluster centroids which are representative of an image cluster, giving us the color palette of an image. 

The code to implement K-means clustering using scikit-learn follows. An interactive version of this notebook can be found on [Colab](https://colab.research.google.com/drive/1EWcej7Hm2F_tGf7-SB2UX6uJ-5QvCEKb).

```python
%matplotlib inline
# Import libraries

import numpy as np
import pandas as pd
from matplotlib import pyplot as plt

from imageio import imread

from skimage.transform import resize

from sklearn.cluster import KMeans

from matplotlib.colors import to_hex
```

To avoid getting different color palettes from different K-means cluster seeds, the random seed is fixed.

```python
# Fix random seed
np.random.seed(0)
```

Read the image file as 2-D array of RGB values.

```python
# Read image file as 2-D array of RGB values
filepath = 'https://images.unsplash.com/photo-1522410818928-5522dacd5066'

img = imread(filepath)

# Show image
plt.axis('off')
plt.imshow(img);
```

![img](/assets/images/color-palette.jpg)

Resize the image to a 200 by 200 pixel image.

```python
img = resize(img, (200, 200))
```

Get each pixel as an array of RGB values.

```python
data = pd.DataFrame(img.reshape(-1, 3),
                    columns=['R', 'G', 'B'])
```

Cluster the pixels into 5 colors based on the RGB value.

```python
kmeans = KMeans(n_clusters=5,
                random_state=0)
```

```python
# Fit and assign clusters
data['Cluster'] = kmeans.fit_predict(data)
```

Get the color palette from the cluster centers.

```python
palette = kmeans.cluster_centers_
```

```python
# Convert data to format accepted by imshow
palette_list = list()
for color in palette:
    palette_list.append([[tuple(color)]])
```

Show the color palette, along with the hexadecimal code for the color.

```python
# Show color palette
for color in palette_list:
    print(to_hex(color[0][0]))
    plt.figure(figsize=(1, 1))
    plt.axis('off')
    plt.imshow(color);
    plt.show();
```

```
#c1a4a9
```



![png](/assets/images/palette-1.png)

```
#38293c
```



![png](/assets/images/palette-2.png)

```
#f2ebed
```



![png](/assets/images/palette-3.png)

```
#df8c18
```



![png](/assets/images/palette-4.png)

```
#1565a1
```



![png](/assets/images/palette-5.png)

Recreate the image with using only colors from color palette.

```python
# Replace every pixel's color with the color of its cluster centroid
data['R_cluster'] = data['Cluster'].apply(lambda x: palette_list[x][0][0][0])
data['G_cluster'] = data['Cluster'].apply(lambda x: palette_list[x][0][0][1])
data['B_cluster'] = data['Cluster'].apply(lambda x: palette_list[x][0][0][2])
```

```python
# Convert the dataframe back to a numpy array
img_c = data[['R_cluster', 'G_cluster', 'B_cluster']].values
```

```python
# Reshape the data back to a 200x200 image
img_c = img_c.reshape(200, 200, 3)
```

```python
# Resize the image back to the original aspect ratio
img_c = resize(img_c, (800, 1200))
```

```python
# Display the image
plt.axis('off')
plt.imshow(img_c)
plt.show()
```

![png](/assets/images/color-palette-clustered.png)

Voila!