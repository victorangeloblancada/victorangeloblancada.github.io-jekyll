---
layout: post
title: "Gifs from Command Line"
category: blog
tags: 
- gif 
- command line 
- coding 
- gifs 
- tumblr
date: 2019-09-20
image: /assets/images/terminal.jpg
description: A quick tutorial on how to create gifs from the command line using FFmpeg.
dropcap: true
draft: false

---

Although many people still disagree over how it is supposed to be pronounced, the gif is undeniably a key element of modern media, with its ubiquitous use across the Internet. While the gif has permeated social media, there are few places online with such a vibrant community of grassroots gif creators as Tumblr. A quick review of Tumblr gif sets shows that most creators use Adobe Photoshop to create gifs, but one need not pay up and subscribe to Adobe Creative Cloud to make animated gifs.

Enter FFmpeg. FFmpeg is a free and open source suite of command line tools for processing audio and video files. In the developers' words: *“FFmpeg is the leading multimedia framework, able to decode, encode, transcode, mux, demux, stream, filter and play pretty much anything that humans and machines have created. It supports the most obscure ancient formats up to the cutting edge.”* 

So, are you ready to get into the world of gif creation? First off, download and install FFmpeg from [here](https://www.ffmpeg.org/download.html).

Once FFmpeg has been installed, you can immediately try to convert any video from any format to a gif, with just a single line on the terminal/ command prompt:

{% highlight bash %}

ffmpeg -ss 2 -t 4 -i input.mp4 -filter_complex "scale=320:-1" output.gif

{% endhighlight %}

Let's break down those that command and its arguments:

1. ffmpeg - This calls the FFmpeg program. 
2. -ss - This is the start time for video conversion, where -ss 2 stands for 2 seconds.
3. -t - This is the duration of video conversion. -t 4 means that FFmpeg will convert 4 seconds of the video. Together with -ss 2, this means that FFmpeg will only convert frames from the 2 seconds into the video to 4 seconds later or 6 seconds from the beginning.
4. -i - This points FFmpeg to the input video for conversion.
5. -filter_complex "scale=320:-1" - The -[filter_complex](https://ffmpeg.org/ffmpeg-filters.html) argument allows users to specify filters. In this case, the scale filter resizes the image to 320 width while keeping the aspect ratio (the -1 length value).
7. output.gif - The output filename is given at the end of the command.

Running this command on a video can give us this image:

![Output gif](/assets/images/gif1.gif)

So far so good, but the quality could improve. 

One of the main drivers of gif quality is its color palette. Thanks to the work of some FFmpeg  developers, namely [ubitux]( http://blog.pkh.me/p/21-high-quality-gif-with-ffmpeg.html ), FFmpeg includes both a function to define a color palette based on a video and a function to encode a video using a specified color palette. We can use these functions to make a better quality gif by extracting a custom color palatte and using that to encode the gif.

Back to the command prompt:

{% highlight bash %}

ffmpeg -ss 2 -t 4 -i input.mp4 -filter_complex "[0:v] palettegen" palette.png
ffmpeg -ss 2 -t 4 -i input.mp4 -i palette.png -filter_complex "[0:v][1:v] paletteuse, scale=320:-1" output.gif

{% endhighlight %}

The first line above uses the [palettegen](https://ffmpeg.org/ffmpeg-filters.html#palettegen-1) filter to generate a 256 color palette to be used in GIF encoding in the next step.

The second line contains two -i arguments, the source video (input.mp4) and the color palette generated from the first line (palette.png). The -filter_complex argument uses the [palatteuse](http://ffmpeg.org/ffmpeg-filters.html#paletteuse) filter to apply the color palatte to the source video through downsampling.

Running the code above generates the following image:

![Output gif](/assets/images/gif2.gif)