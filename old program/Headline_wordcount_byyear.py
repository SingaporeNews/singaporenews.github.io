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
from sklearn import manifold
from sklearn.metrics import euclidean_distances
from sklearn.decomposition import PCA


logging.basicConfig(filename='Summary_stats.log',level=logging.DEBUG)

#Timer
tic = timeit.default_timer()


#for year in range(1955,2010):
#	logging.info('Reading headlines for %d...', year)
#	with open('Headlines_' + str(year) + '.txt') as f:
#		n = 1
#		for x in f.readlines()[1:]:
#			x = re.sub(r'\xe2\x80\x93|\xe2\x80\x94|\xc3\x82|\xe2\x80\xa2|\xc2\xa75|14\xbd|\0xc2', r' ', x)
#			if re.search(r'\b(miscellaneous|am latest|highlights|section|pages|stop press|latest)\b', x) is None:
#				x0 = x.strip('\r\n').split('\t')
#				nwords = len((x0[1].split()))
#				x0.append(nwords)
#				with open('Headlines_1955_2009_wordcount.txt', 'a') as g:
#						writer = csv.writer(g, delimiter='\t')
#						writer.writerows([x0])
#				logging.info('Headline #%d done', n)
#				n +=1
#		logging.info('Year %d done!', year)


#Count of words, by year
allwords = []
#Count of tags, by year
alltags = []

#Cycle through each year's headlines
#######################################################################
#Obtain frequency for tag and word in the current year
#######################################################################

count = 1
for year in range(1955,2010):
	#unvectorized headlines for current year, for tagging
	currentstring = []
	#unvectorized headlines for current year, lowercase
	current = []
	logging.info('Reading headlines for %d...', year)
	with open('Headlines_' + str(year) + '.txt') as f:
		for x in f.readlines()[1:]:
			x = re.sub(r'\xe2\x80\x93|\xe2\x80\x94|\xc3\x82|\xe2\x80\xa2|\xc2\xa75|14\xbd|\0xc2', r' ', x)
			if re.search(r'\b(miscellaneous|am latest|highlights|section|pages|stop press|latest)\b', x) is None:
				x = re.sub(r'([()?:!,\'])', r'', x)
				#remove non-informative headlines
				x = x.strip('\r\n').split('\t')
				x = x[1].lower()
				currentstring.append(x.decode('utf-8'))
				current.append(x)
		logging.info('Grabbed %d headlines for tagging and counting', year)

		#Tag unvectorized headlines
		logging.info('PoS tagging %d headlines...', year)
		tokens = [nltk.word_tokenize(headline) for headline in currentstring]
		tagged = [nltk.pos_tag(token) for token in tokens]
		#Chain all word,tag tuples for current year
		itag_chain = itertools.chain.from_iterable(tagged)
		tag_chain = list(itag_chain)

		#Get word and tag bags for current year, count
		logging.info('Counting frequency of words in %d...', year)
		wordset = set(word for word,tag in tag_chain)
		worddict = dict(tag_chain)
		wordbag = [word for word,tag in tag_chain]
		counter = collections.Counter(wordbag)
		freqdict = dict(counter.most_common())
		wfreq =[]
		for word in wordset:
			w = [year,word.encode('utf-8'),worddict[word],freqdict[word]]
			wfreq.append(w)
		with open('Word_tag_frequency.csv', 'a') as h:
			writer = csv.writer(h, delimiter=',')
			writer.writerows(wfreq)
		allwords.append(wfreq)

		logging.info('Counting frequency of tags in %d...', year)
		tagbag = [tag for word,tag in tag_chain]
		counter = collections.Counter(tagbag)
		freq = counter.most_common()
		tfreq = [list(y) for y in freq]
		for y in tfreq:
			y.append(year) 
		with open('Tag_frequency.csv', 'a') as j:
			writer = csv.writer(j, delimiter=',')
			writer.writerows(tfreq)
		alltags.append(tfreq)

		logging.info('Year %d done!', year)

		if count % 10 == 0:
			toc = timeit.default_timer()
			timer = '%.2f' %((toc - tic)/60)
			logging.info("Years processed: %d Time elapsed: %s mins",count,timer)
		count +=1

#Open sparse matrix of words by year
with open('transposed_terms_6jan15.csv') as f:
	termst = [x.strip().split(',') for x in f.readlines() if x]
	terms = [list(y) for y in zip(*termst)]

#Index of words
words = termst[0][1:]

seeder = 1918
random.seed(seeder)
index = random.sample(range(1,len(words)),1000)
sample = [terms[i] for i in index]
samplewords = [words[i-1] for i in index]

#numpy array
termsmat = numpy.array([int(y) for y in sample[0][1:]])
for wordrow in sample[1:]:
	intwordrow = [int(y) for y in wordrow[1:]]
	termsmat = numpy.vstack([termsmat,intwordrow])



#Calculate matrix of (dis)similarities
similarities = euclidean_distances(sparse)

#Project via multi-dimensional scaling
mds = manifold.MDS(n_components=2, max_iter=1000, eps=1e-6, random_state=seeder,
                   dissimilarity="precomputed", n_jobs=1)
project = mds.fit(similarities)

#Varimax rotation
pca = PCA(n_components=2)
project = pca.fit_transform(project)
	


