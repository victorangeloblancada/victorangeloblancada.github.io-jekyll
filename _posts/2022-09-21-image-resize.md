---
layout: post
title: "Resize an Image to 4R"
category: blog
tags: 
- blog
- python
- image processing
- coding
- automation
date: 2022-09-21
image: /assets/images/frames.jpg
dropcap: False
---

*This is part of a series of short blog posts about automating <s>boring</s> repetitive work using Python.*

The following code automatically resizes all images in the directory specified in `mypath` to 4R aspect ratio. 4R images have a size of 4 inches by 6 inches (or 10.2 cm by 15.2 cm), which means that images must have a 2 by 3 aspect ratio. 



```python
# Import libraries
from PIL import Image

from os import listdir
from os.path import isfile, join

# Directory containing the images
mypath = 'Photos For Printing'
d1 = 4 # First dimension
d2 = 6 # Second dimension

# Resize mode: Crop or extend with white space?
#mode = 'Crop'
mode = 'Extend'

files = [f for f in listdir(mypath) if isfile(join(mypath, f))]

for myfile in files:
    # Opens a image in RGB mode
    im = Image.open(mypath+'/'+myfile)

    # Process image
    if mode == 'Crop':
        if im.height < im.width:
            h = d1
            w = d2
            if im.width / im.height > d2 / d1:
                w = im.width
                h = im.width * d1 / d2
                # Setting the points for cropped image
                left = 0
                top = int( (im.height - h) / 2 )
                right = im.width
                bottom = int( m.height - (im.height - h) / 2 )
            else:
                w = im.width * d1 / d2
                h = im.height
                # Setting the points for cropped image
                left = int( (im.width - w) / 2 )
                top = 0
                right = int( im.width - (im.width - w) / 2 )
                bottom = im.width
        else:
            h = d2
            w = d1
            if im.height / im.width > d2 / d1:
                w = im.width * d1 / d2
                h = im.height
                # Setting the points for cropped image
                left = int( (im.width - w) / 2 )
                top = 0
                right = int( im.width - (im.width - w) / 2 )
                bottom = im.width
            else:
                w = im.width
                h = im.width * d1 / d2
                # Setting the points for cropped image
                left = 0
                top = int( (im.height - h) / 2 )
                right = im.width
                bottom = int( m.height - (im.height - h) / 2 )
    else:
        if im.height < im.width:
            h = d1
            w = d2
            if im.width / im.height > d2 / d1:
                w = im.width
                h = im.width * d1 / d2
                # Setting the points for extended image
                left = 0
                top = int( (im.height - h) / 2 )
                right = im.width
                bottom = int( im.height - (im.height - h) / 2 )
            else:
                w = im.height * d2 / d1
                h = im.height
                # Setting the points for extended image
                left = int( (im.width - w) / 2 )
                top = 0
                right = int( im.width - (im.width - w) / 2 )
                bottom = im.height
        else:
            h = d2
            w = d1
            if im.height / im.width > d2 / d1:
                w = im.height * d1 / d2
                h = im.height
                # Setting the points for extended image
                left = int( (im.width - w) / 2 )
                top = 0
                right = int( im.width - (im.width - w) / 2 )
                bottom = im.height         
            else:
                w = im.width
                h = im.width * d2 / d1
                # Setting the points for extended image
                left = 0
                top = int( (im.height - h) / 2 )
                right = im.width
                bottom = int( im.height - (im.height - h) / 2 )

    # Cropped image of above dimension
    im1 = Image.new('RGB', (right - left, bottom - top), (255, 255, 255))
    im1.paste(im, (-left, -top))

    # Save image
    im1.save(mypath+'/'+myfile)

```
