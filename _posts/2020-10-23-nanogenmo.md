---
layout: post
title: "National Novel Generation Month 2020"
category: blog
tags: 
- python
- nlp
- natural language processing
- automation
- nanogenmo
- nanowrimo
date: 2020-10-23
image: /assets/images/nanogenmo.jpg
dropcap: False
---

I'm joining NaNoGenMo this November 2020. NaNoGenMo, which is short for National Novel Generation Month, is a spin on NaNoWriMo or National Novel Writing Month, where instead of spending November writing a 50,000 word novel, the goal is instead to write code that will generate text for a 50,000 novel for you.

Tempting as it may be to use deep learning text generation methods, the sheer quality of GPT-3 (or even GPT-2) takes away both the difficulty and the fun from the process.

Instead, I am going to use very basic Python libraries such as the humble random and time modules. I will also use Selenium for web scraping. There will be plenty of web scraping, mostly from TV Tropes.

My code can be found below:

```python
# Import libraries
import numpy as np
import pandas as pd
import random
import time

from selenium import webdriver

driver_path = 'C:/Users/victorblancada/Downloads/geckodriver-v0.27.0-win64/geckodriver.exe'
driver = webdriver.Firefox(executable_path=driver_path)

word_count_goal = 50000

with open("NaNoGenMo.md", "r") as f:
      main_story = f.read()

#main_story = ''
word_count = 0
name_list = ['Alice',
			 'Bob',
             # Insert more names here
			 'Charlie']

chapter = 0

while word_count < word_count_goal:
      chapter += 1
      main_story += '\n\n'
      main_story += '# Chapter '+str(chapter)
      main_story += '\n\nIt was a '
      main_story += random.choice(['rainy',
                                   'sunny',
                                   'stormy',
                                   'hot',
                                   'cold',
                                   'balmy',
                                   'warm'])
      main_story += random.choice([' evening.',
                                   ' morning.',
                                   ' day.',
                                   ' afternoon.'])
      main_story += '\n\n'
      main_story += random.choice(['\"So you have a story for me?\"',
                                   '\"I heard you have a story for me,\"',
                                   '\"So you have a pitch for me?\"',
                                   '\"I heard you have a pitch for me,\"'])
      main_story += random.choice([' the producer',
                                                 ' he',
                                                 ' the person',
                                                 ' the man'])
      main_story += random.choice([' prompted.',
                                                 ' asked.',
                                                 ' queried.',
                                                 ' nodded.',
                                                 ' demanded.'])

      main_story += '\n\n'
      main_story += random.choice(['The writer',
                                   'She',
                                   'The author',
                                                 'The screenwriter',
                                                 'The scriptwriter',
                                                 'The woman'])
      main_story += ' '
      main_story += random.choice(['cleared her throat',
                                                 'bit her lip',
                                                 'fidgeted',
                                                 'played with her pen',
                                                 'swallowed'])
      main_story += ' before '
      main_story += random.choice(['answering',
                                                 'replying',
                                                 'responding',
                                                 'saying',
                                                 'recounting',
                                                 'sharing'])
      main_story += ', '
      main_story += random.choice(['\"Yes, I do! ',
                                                 '\"Absolutely! ',
                                                 '\"Yes! ',
                                                 '\"Right you are! ',
                                                 '\"You\'re right! '])
      main_story += random.choice(['Here it goes:\"',
                                   'It goes something like this:\"',
                                   'So here\'s the story:\"'])

      url = 'https://tvtropes.org/pmwiki/storygen.php'
      driver.get(url)

      elements = ['Setting',
                  'Plot',
                  'Narrative Device',
                  'Hero',
                  'Villain',
                  'Character as Device',
                  'Characterization Device']
      links = pd.DataFrame()

      urls = dict()
      tropes = dict()
      for i in elements:
          urls[i] = driver.find_element_by_xpath('//*[@id="main-article"]/div[1]/div['+str(elements.index(i)+1)+']/a').get_attribute('href')
          tropes[i] = driver.find_element_by_xpath('//*[@id="main-article"]/div[1]/div['+str(elements.index(i)+1)+']/a').text
      tropes['Hero Name'] = random.choice(name_list)
      tropes['Villain Name'] = random.choice(name_list)
      tropes['Device Name'] = random.choice(name_list)

      desc = dict()
      for i in elements:
          url = urls[i]
          try:
              driver.get(url.replace('Main', 'Laconic'))
              desc[i] = driver.find_element_by_xpath('//*[@id="main-article"]/p').text
              if desc[i] == '':
                  driver.get(url)
                  desc[i] = driver.find_element_by_xpath('//*[@id="main-article"]/p[1]').text
          except:
              driver.get(url)
              desc[i] = driver.find_element_by_xpath('//*[@id="main-article"]/p[1]').text
              pass

      story = ''
      story = story + 'Welcome to ' + tropes['Setting'] + ' - ' + desc['Setting'] + ' '
      story = story + 'Our hero, ' + tropes['Hero Name'] + ', is a ' + tropes['Hero'] + ' - ' + desc['Hero'] + ' '
      story = story + tropes['Hero Name'] + '\'s story is this: ' + desc['Plot'] + ' '
      story = story + 'What stands in ' + tropes['Hero Name'] + '\'s way is '+ tropes['Villain Name'] +', a ' + tropes['Villain'] + ' - ' + desc['Villain'] + ' '
      story = story + 'The turning point happens when: ' + desc['Narrative Device'] + ' This is ' + tropes['Narrative Device'] + '. '
      story = story + 'Throughout all of this, both ' + tropes['Hero Name'] + ' and ' + tropes['Villain Name'] + ' have to deal with ' + tropes['Device Name'] + ', a ' + tropes['Character as Device'] + ' - ' + desc['Character as Device']

      main_story += '\n\n'
      main_story += '\"'+story+'\"'
      word_count = len(main_story.split())
      if word_count < word_count_goal:
            main_story += '\n\n'
            main_story += random.choice(['The producer scratched his head.',
                                                       'The producer rubbed his beard.',
                                                       'The producer crinkled his brow.',
                                                       'The producer shook his head.'])
            main_story += ' '
            main_story += random.choice(['\"It\'s not working for me.\"',
                                                       '\"Good, but not good enough.\"',
                                                       '\"I think I\'ll pass this time.\"',
                                                       '\"No. Just no.\"',
                                                       '\"Come back again next time with something better.\"',
                                                       '\"It\'s not blockbuster material.\"'])
            main_story += '\n\n---\n\n'
      else:
            main_story += '\n\n\"I think we have a winner!\" the producer exclaimed.'
            main_story += '\n\nThe writer breathed a sigh of relief.'
      
      text_file = open("NaNoGenMo.md", "w")
      text_file.write(main_story)
      text_file.close()
      if chapter % 10 == 0:
            print('Written', chapter, 'chapters and', word_count, 'words...')
      time.sleep(600)

#print(main_story)
print('Finished!')
```



*Victor Blancada is a data scientist. Visit his LinkedIn page [here](https://www.linkedin.com/in/geloblancada/).* 