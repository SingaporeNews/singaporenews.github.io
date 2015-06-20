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

#Open sparse matrix of words by year, transpose
with open('transposed_terms_6jan15.csv') as f:
	termst = [x.strip().split(',') for x in f.readlines() if x]
	terms = [list(y) for y in zip(*termst)]

#Index of words
words = termst[0][1:]

#Sample of words to perform MDS
seeder = 1918
nsamp = 2000
random.seed(seeder)
index = random.sample(range(1,len(words)),nsamp)
sample = [terms[i] for i in index]
samplewords = [words[i-1] for i in index]

#numpy array
termsmat = numpy.array([int(y) for y in sample[0][1:]])
for wordrow in sample[1:]:
	intwordrow = [int(y) for y in wordrow[1:]]
	termsmat = numpy.vstack([termsmat,intwordrow])

#Calculate matrix of (dis)similarities or correlations
dissimilarities = euclidean_distances(termsmat)
correlations = numpy.corrcoef(termsmat)

tic = timeit.default_timer()
#Project via multi-dimensional scaling
mds = manifold.MDS(n_components=2, max_iter=1000, eps=1e-6, random_state=seeder,
                   dissimilarity="precomputed", n_jobs=1)
project = mds.fit(dissimilarities).embedding_
#project = mds.fit(correlations).embedding_

#Varimax rotation
pca = PCA(n_components=2)
project = pca.fit_transform(project)
project = project.tolist()

toc = timeit.default_timer()
timer = '%.2f' %((toc - tic)/60)
logging.info("Time elapsed for MDS projection, %d sample size: %s mins", nsamp, timer)

test = []
for (sampleword,row) in zip(samplewords,project):
	w = [sampleword]
	for dim in row:
		w.append(dim)
	test.append(w)

with open('MDS_word_by_year.csv', 'w') as g:
	writer = csv.writer(g, delimiter=',')
	writer.writerows(test)



	


