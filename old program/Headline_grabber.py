from __future__ import with_statement
import itertools
import collections
import numpy
import datetime
import timeit
import logging
import nltk
import csv
import re
import pandas
import pickle
import codecs
import random
import json
from gensim import corpora, models, similarities
from nltk.util import ngrams 
from datetime import timedelta
from time import strftime
from sklearn.feature_extraction.text import CountVectorizer 

#Write process to a log file
logging.basicConfig(filename='Headline_grabber.log',level=logging.DEBUG)

#Timer
tic = timeit.default_timer()


###############################
#Corpus of headlines, original
###############################
allhead = []

count = 1
for year in range(1955,2010):
	#unvectorized headlines for current year, for tagging
	head = []
	logging.info('Reading headlines for %d...', year)
	with open('Headlines_' + str(year) + '.txt') as f:
		for x in f.readlines()[1:]:
			x = re.sub(r'\xe2\x80\x93|\xe2\x80\x94|\xc3\x82|\xe2\x80\xa2|\xc2\xa75|14\xbd|\0xc2', r' ', x)
			if re.search(r'\b(miscellaneous|am latest|highlights|section|pages|stop press|latest)\b', x) is None:
				x0 = x.strip('\r\n').split('\t')
				head.append(x0[1])
	
		allhead.append(head)
		logging.info('Done!', year)

		#Counter for timer
		if count % 10 == 0:
			toc = timeit.default_timer()
			timer = '%.2f' %((toc - tic)/60)
			logging.info("Years processed: %d Time elapsed: %s mins",count,timer)
		count +=1

##########################################
#Open word set containing year, frequency
##########################################

with open('Words_allyears_6jan15.csv') as f:
	curated = [x.strip().split(',') for x in f.readlines()[1:] if x]

#numpy array to subset by column
ncurated = numpy.array(curated)

#Function to grab headlines according to word
def grepWord(word,headlinelist):
	hits =[]
	for headline in headlinelist:
		if re.search('\\.',word) is not None:
			word = word.strip('"')
			wordsub = re.sub('\$',r'\$',word)
			my_regex = re.sub('\.',r'\.',wordsub)
			aa = re.search(my_regex, headline, re.IGNORECASE)
			if aa is not None:
				hits.append(headline)
		else:
			word = word.strip('"')
			my_regex = '\\b' + word + '\\b' 
			aa = re.search(my_regex, headline, re.IGNORECASE)
			if aa is not None:
				hits.append(headline)
	return hits

# for headline in allhead[1]:
 #	aa = re.search(my_regex, headline, re.IGNORECASE)
 #	if aa is not None:
 #		hits.append(headline)

#Grab and write immediately to file
for year,head in zip(range(1955,2010),allhead):
	#links = []
	n = 1
	yearcur = ncurated[ncurated[:,1] == str(year)].tolist()
	for word in yearcur:
		hlist = grepWord(word[0],head)
		#write to file
		with open('Words_all_headlines_6jan15.csv','a') as h:
			writer = csv.writer(h, delimiter=',')
			for i in range(0,len(hlist)):
				story = [word[0].strip('"'),year,hlist[i]]
				writer.writerows([story])
			logging.info('Completed word #%d in year %d',n,year)
			n +=1
	
