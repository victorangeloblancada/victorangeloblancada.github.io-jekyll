---
layout: post
title: "Adding a Date Watermark to an Image"
category: blog
tags: 
- blog
- python
- image processing
- coding
- automation
date: 2022-09-20
image: /assets/images/prints.jpg
dropcap: False
---

*This is part of a series of short blog posts about automating <s>boring</s> repetitive work using Python.*

The following code automatically adds a date watermark to all images in the directory specified in `mypath`. 



```python
# Import libraries
from PIL import Image, ImageFont, ImageDraw
from os import listdir
from os.path import isfile, join

def get_date_taken(path):
    """Function to get the date taken EXIF data.
    path: File path of image.
    """
    return Image.open(path)._getexif()[36867]

# Specify directory
mypath = 'Photos-001'

# Get list of files in the specified directory
onlyfiles = [f for f in listdir(mypath) if isfile(join(mypath, f))]

# Loop through list of files
for image_fn in onlyfiles:
    # Open image
    watermark_image = Image.open(mypath+'/'+image_fn) 

    # Get image dimensions
    width, height = watermark_image.size

    # Initialize ImageDraw
    draw = ImageDraw.Draw(watermark_image)

    # Set font size to around 3% of height (height divided by 33)
    font = ImageFont.truetype("arial.ttf", height//33)

    # Add watermark
    draw.text((0, height - (height//33)), 
              get_date_taken(mypath+'/'+image_fn), 
              font=font,
              fill=(255, 165, 0, 255))

    # Save image
    watermark_image.save(mypath+' Labeled/'+image_fn)
```
