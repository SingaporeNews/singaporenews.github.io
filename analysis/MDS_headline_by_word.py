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

#Cycle through each year's headlines
#######################################################################
#Obtain frequency for tag and word in the current year
#######################################################################
currentall = [['yearCol','indexCol','headCol','wordCol','countCol']]
headlines = []

count = 0
countyear = 0
for year in range(1955,2010):
	#unvectorized headlines for current year, lowercase
	current = []
	logging.info('Reading headlines for %d...', year)
	with open('Headlines_' + str(year) + '.txt') as f:
		for x in f.readlines()[1:]:
			x = re.sub(r'\xe2\x80\x93|\xe2\x80\x94|\xc3\x82|\xe2\x80\xa2|\xc2\xa75|14\xbd|\0xc2', r' ', x)
			if re.search(r'\b(miscellaneous|am latest|highlights|section|pages|stop press|latest)\b', x) is None:
				count +=1
				x0 = re.sub(r'([()?:!,\'])', r'', x)
				#remove year tag
				x1 = x0.strip('\r\n').split('\t')
				x1 = x1[1].lower()
				#Decode on utf-8 to enable nltk processing
				x2 = x1.decode('utf-8')
				headlines.append(x2)
				tokens = nltk.word_tokenize(x2)
				counter = collections.Counter(tokens)
				freqdict = dict(counter.most_common())
				for word in tokens:
					w = [year,count,x1,word.encode('utf-8'),freqdict[word]]
					current.append(w)
					currentall.append(w)
		with open('Word_frequency_byheadline.csv', 'a') as g:
			writer = csv.writer(g, delimiter=',')
			writer.writerows(current)

		countyear +=1
		logging.info('Year %d done!', year)

		if countyear % 10 == 0:
			toc = timeit.default_timer()
			timer = '%.2f' %((toc - tic)/60)
			logging.info("Years processed: %d Time elapsed: %s mins",count,timer)
		countyear +=1

#Use scikit-learn's tfidf vectorizer
#define own tokenization function based on stemmed terms

#stemmer = PorterStemmer()

#def stem_tokens(tokens, stemmer):
 #   stemmed = []
  #  for item in tokens:
   #     stemmed.append(stemmer.stem(item))
    #return stemmed

def tokenize(text):
    tokens = nltk.word_tokenize(text)
    #stems = stem_tokens(tokens, stemmer)
    return tokens

#stopwords
with open('stoplist_20feb.sp') as f:
	stopper = [x.strip() for x in f.readlines() if x]

stoplist = []
for word in stopper:
	stoplist.append(word.decode('utf-8'))

#Initialize tdidf vectorizer
tfidf = TfidfVectorizer(tokenizer=tokenize, stop_words=stoplist)

#Operate on random 2.5% sample of headlines
seeder = 1918
random.seed(seeder)
nsamp = 6000
index = random.sample(range(0,len(headlines)),nsamp)
sample = [headlines[i] for i in index]

#Get transformed sparse matrix
sparse = tfidf.fit_transform(sample)

#Calculate matrix of (dis)similarities
similarities = euclidean_distances(sparse)

tic = timeit.default_timer()
#Project via multi-dimensional scaling
mds = manifold.MDS(n_components=2, max_iter=1000, eps=1e-6, random_state=seeder,
                   dissimilarity="precomputed", n_jobs=1)
project = mds.fit(similarities).embedding_

#Varimax rotation
pca = PCA(n_components=2)
project = pca.fit_transform(project)

toc = timeit.default_timer()
timer = '%.2f' %((toc - tic)/60)
logging.info("Time elapsed for MDS projection, %d sample size: %s mins", nsamp, timer)

test = []
for (i,samplehead,row) in zip(index,sample,project2):
	w = [i,samplehead.encode('utf-8')]
	for dim in row:
		w.append(dim)
	test.append(w)

with open('MDS_headline_by_word.csv', 'w') as g:
	writer = csv.writer(g, delimiter=',')
	writer.writerows(test)












