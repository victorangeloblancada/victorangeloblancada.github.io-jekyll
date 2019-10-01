---
layout: post
title: "GIFs from Command Line"
category: blog
tags: gif command line coding gifs tumblr
date: 2019-09-20
featured-img: /assets/images/terminal.jpg
dropcap: true
draft: true

---

Although many people still disagree over how it is supposed to be pronounced, the gif is undeniably a key element of modern media, with its ubiquitous use across the Internet. While the gif has permeated social media, there are few places online with such a vibrant community of grassroots gif creators as Tumblr. A quick review of Tumblr gif sets shows that most creators use Adobe Photoshop to create gifs, but one need not pay up and subscribe to Adobe Creative Cloud to make animated gifs.

Enter FFmpeg. FFmpeg is a free and open source suite of command line tools for processing audio and video files. In the developers' words: *“FFmpeg is the leading multimedia framework, able to decode, encode, transcode, mux, demux, stream, filter and play pretty much anything that humans and machines have created. It supports the most obscure ancient formats up to the cutting edge.”*

So, are you ready to get into the world of gif creation? First off, download and install FFmpeg from [here](https://www.ffmpeg.org/download.html).

Once FFmpeg has been installed, you can immediately try to convert any video from any format to a gif, with just a single line on the terminal/ command prompt:

{% highlight bash %}

ffmpeg -ss 59 -t 4 -i input.mkv -vf scale=320:-1 -f gif output.gif

{% endhighlight %}

Let's break down those that command and its arguments:

1. ffmpeg - This calls the FFmpeg program. 
2. -ss - This is the start time for video conversion, where -ss 59 stands for 59 seconds.
3. -t - This is the duration of video conversion. -t 4 means that FFmpeg will convert 4 seconds of the video. Together with -ss 59, this means that FFmpeg will only convert frames from the 59 seconds into the video to 4 seconds later or 63 seconds from the beginning.
4. -i - This points FFmpeg to the input video for conversion.
5. -vf scale=320:-1 - This tells FFmpeg to resize the image to 320 width while keeping the aspect ratio (the -1 length value)
6. -f - This specifies that the video must be converted to a different filetype, in this case, a gif.
7. output.gif - The output filename is given at the end of the command.

Running this command on a video gives us this image:



{% highlight bash %}

Hello

{% endhighlight %}



Perhaps it is because an entire generation of Harry Potter readers came of age 