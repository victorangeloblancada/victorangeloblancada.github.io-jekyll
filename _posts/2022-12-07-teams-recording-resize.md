---
layout: post
title: "Cropping an MS Teams Recording"
category: blog
tags: 
- blog
- python
- video processing
- coding
- automation
date: 2022-12-07
image: /assets/images/window.jpg
dropcap: False
---

*This is part of a series of short blog posts about automating <s>boring</s> repetitive work using Python.*

Have you ever saved a recording of an MS Teams call where someone shared their screen and wanted to crop the recording to only keep the screen share? If so, you're in luck.

This solution requires the **ffmpeg** library which I previously discussed as part of [a post covering creating GIFs from the command line]( /blog/2019/09/20/command-line-gifs.html ).

Running the following code in the command line automatically crops the MS Teams recording named "path_to_recording.mp4" and saves the output to "output.mp4". 

    ffmpeg -i "path_to_recording.mp4" -filter:v "crop=1725:970:98:0" output.mp4

Before:

![Original recording](/assets/images/Teams_Sample_Before.jpg)

After:

![Cropped recording](/assets/images/Teams_Sample_After.jpg)

I do acknowledge that this solution depends on how MS Teams orients its interface and your screen resolution, but even if this changes, the general principle stays the same. You only need to alter the `crop=1725:970:98:0` part of the code. This section uses the following order of arguments: `crop=out_width:out_height:top_left_corner_x:top_left_corner_y`. So if you want to keep a video of width 1920 and height 1080 where the top left corner is at (0,0), the code would instead be:

```
ffmpeg -i "path_to_recording.mp4" -filter:v "crop=1920:1080:0:0" output.mp4
```

