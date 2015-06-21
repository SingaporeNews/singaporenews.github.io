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
#from gensim import corpora, models, similarities
#from nltk.util import ngrams 
from datetime import timedelta
from time import strftime
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.stem.porter import PorterStemmer



logging.basicConfig(filename='Processing_abstracts.log',level=logging.DEBUG)

#Timer
tic = timeit.default_timer()


#Count of words, by year
#allwords = []
#Count of tags, by year
#alltags = []

#Cycle through each year's abstracts
#######################################################################
#Obtain frequency for tag and word in the current year
#######################################################################

#with open('Abstracts_count.csv', 'w') as k:
#	writer = csv.writer(k, delimiter=',')
#	writer.writerows([['Year','DayCount','ArticleCount']])

count = 1
for year in range(1910,2010):
	#unvectorized abstracts for current year, decoded, for tagging
	homestring = []
	#unvectorized abstracts for current year
	home = []
	#unvectorized abstracts for current year, wire news, decoded, for tagging
	wirestring = []
	#unvectorized abstracts for current year, wire news
	wire = []
	#Number of valid abstracts for that year
	dater = []
	datermark = []
	logging.info('Reading abstracts for %d...', year)
	with open('Abstracts_' + str(year) + '.txt') as f:
		for x in f.readlines()[1:]:
			x = re.sub(r'([()?:!,\'])', r'', x)
			#remove non-informative abstracts
			x = x.strip('\r\n').split('\t')
			dater.append(x[0])
			if x[1]!='909090' and x[1]!='808080':
				para = x[2]
				datermark.append(1)
				if re.search(r'\b(UP|UPI|REUTER|AP|AFP|AGENCE|NYT|NEW YORK TIMES|BLOOMBERG|BERNAMA|ASSOCIATED PRESS)\b', x[1]) is None:
					homestring.append(para.decode('utf-8'))
					home.append(para)
				else:
					wirestring.append(para.decode('utf-8'))
					wire.append(para)
			else:
				datermark.append(0)

		logging.info('Grabbed %d abstracts for tagging and counting', year)

		#Tag unvectorized abstracts, non-wire news
		logging.info('PoS tagging %d Home abstracts...', year)
		tokens = [nltk.word_tokenize(abstract) for abstract in homestring]
		tagged = [nltk.pos_tag(token) for token in tokens]
		#Chain all word,tag tuples for current year
		itag_chain = itertools.chain.from_iterable(tagged)
		tag_chain = list(itag_chain)

		#Get word and tag bags for current year, count
		logging.info('Counting frequency of Home news words in %d...', year)
		wordset = set(word for word,tag in tag_chain)
		worddict = dict(tag_chain)
		wordbag = [word for word,tag in tag_chain]
		counter = collections.Counter(wordbag)
		freqdict = dict(counter.most_common())
		wfreq =[]
		for word in wordset:
			w = [year,word.encode('utf-8'),worddict[word],freqdict[word]]
			wfreq.append(w)
		with open('Homenews_word_tag_frequency.csv', 'a') as h:
			writer = csv.writer(h, delimiter=',')
			writer.writerows(wfreq)
		#allwords.append(wfreq)

		logging.info('Counting frequency of Home news tags in %d...', year)
		tagbag = [tag for word,tag in tag_chain]
		counter = collections.Counter(tagbag)
		freq = counter.most_common()
		tfreq = [list(y) for y in freq]
		for y in tfreq:
			y.append(year) 
		with open('Homenews_tag_frequency.csv', 'a') as j:
			writer = csv.writer(j, delimiter=',')
			writer.writerows(tfreq)
		#alltags.append(tfreq)

				#Tag unvectorized abstracts, wire news
		logging.info('PoS tagging %d Wire abstracts...', year)
		tokens = [nltk.word_tokenize(abstract) for abstract in wirestring]
		tagged = [nltk.pos_tag(token) for token in tokens]
		#Chain all word,tag tuples for current year
		itag_chain = itertools.chain.from_iterable(tagged)
		tag_chain = list(itag_chain)

		#Get word and tag bags for current year, count
		logging.info('Counting frequency of Wire news words in %d...', year)
		wordset = set(word for word,tag in tag_chain)
		worddict = dict(tag_chain)
		wordbag = [word for word,tag in tag_chain]
		counter = collections.Counter(wordbag)
		freqdict = dict(counter.most_common())
		wfreq =[]
		for word in wordset:
			w = [year,word.encode('utf-8'),worddict[word],freqdict[word]]
			wfreq.append(w)
		with open('Wirenews_word_tag_frequency.csv', 'a') as h:
			writer = csv.writer(h, delimiter=',')
			writer.writerows(wfreq)
		#allwords.append(wfreq)

		logging.info('Counting frequency of Wire news tags in %d...', year)
		tagbag = [tag for word,tag in tag_chain]
		counter = collections.Counter(tagbag)
		freq = counter.most_common()
		tfreq = [list(y) for y in freq]
		for y in tfreq:
			y.append(year) 
		with open('Wirenews_tag_frequency.csv', 'a') as j:
			writer = csv.writer(j, delimiter=',')
			writer.writerows(tfreq)
		#alltags.append(tfreq)

		logging.info('Year %d done!', year)

		if count % 5 == 0:
			toc = timeit.default_timer()
			timer = '%.2f' %((toc - tic)/60)
			logging.info("Years processed: %d Time elapsed: %s mins",count,timer)
		count +=1

		unique = []
		for date,mark in zip(dater,datermark):
			if mark==1:
				unique.append(date)
		uniqueset = set(unique)

		total = [year,len(uniqueset),len(unique)]
		with open('Abstracts_count.csv', 'a') as k:
			writer = csv.writer(k, delimiter=',')
			writer.writerows([total])

toc = timeit.default_timer()
timer = '%.2f' %((toc - tic)/60)
logging.info("Total years processed: %d Total time elapsed: %s mins",count,timer)

	


