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
logging.basicConfig(filename='Processing_abstract_grabber.log',level=logging.DEBUG)

#Timer
tic = timeit.default_timer()

##########################################
#Open word set containing year, frequency
##########################################

logging.info('Reading corpus of topwords of the Straits Times...')
with open('Topwords_abstract_bypage_v4_forjson.csv') as f:
	curated = [x.strip().split(',') for x in f.readlines()[1:] if x]

#numpy array to subset by column
ncurated = numpy.array(curated)

#############################################
#Function to grab abstracts according to word
#############################################

def grepAbs(word,abstractlist):
	hits =[]
	for abstract in abstractlist:
		#remove annoying non-ascii characters!!
		abstract = ''.join([x for x in abstract if ord(x) < 128])
		abstract = re.sub(r'[\&\#\/\^\?\!\*\|\%\@\'\\\\\:\;\""\(\)]',r'',abstract)
		word = word.strip('"')
		my_regex = '\\b' + word + '\\b' 
		aa = re.search(my_regex, abstract)
		if aa is not None:
			hits.append(abstract)
	#Sample only four abstracts
	index = random.sample(range(0,len(hits)),4)
	randhits = [hits[x] for x in index]
	return randhits

###############################
#Corpus of abstracts, by year
###############################
newabs = []
fullabs = []

count = 1
for year in range(1845,2010):
	#wordset for current year
	yearcur = ncurated[ncurated[:,0] == str(year)]
	pagelist = set(yearcur[:,2].tolist())
	#unvectorized abstracts for current year, with page number extracted
	newabs = []
	logging.info('Reading abstracts for %d...', year)
	with open('Abstracts_' + str(year) + '.txt') as f:
		for x in f.readlines()[1:]:
			#x = re.sub(r'([()?:!,\'])', r'', x)
			#remove non-informative abstracts
			x = x.strip('\r\n').split('\t')
			#print x[0]
			if x[1]!='909090' and x[1]!='808080':
				page = x[1]
				page = page.split(' ')
				#print page
				pageno = page[1]
				#date,pageno,abstract 
				newrow = [pageno, x[2]]
				newabs.append(newrow)

		newabs = numpy.array(newabs)
		if len(newabs)>0:
			logging.info('Grabbed %d abstracts for pairing', year)
		else:
			logging.info('No abstracts for %d', year)
		#print newabs

		if len(yearcur)>0:
			for i in pagelist:
				logging.info('Grabbing abstracts for page %s of %d...',page,year)
				page = str(i)
				#Set of abstracts for page-year
				curpage_abs = newabs[newabs[:,0] == page][:,1].tolist()
				#Set of words for page-year
				curpage_words = yearcur[yearcur[:,2] == page][:,1].tolist()
				logging.info('Writing to file...')
				for word in curpage_words:
					alist = grepAbs(word,curpage_abs)
					for abstract in alist:
						newrow = [year,page,word.strip('"'),abstract.strip('"')]
						with open('Topwords_abstract_bypage_complete.csv','a') as h:
							writer = csv.writer(h, delimiter=',')
							writer.writerows([newrow])
							fullabs.append(newrow)
				logging.info('Done!')

		if count % 10 == 0:
			toc = timeit.default_timer()
			timer = '%.2f' %((toc - tic)/60)
			logging.info("Years processed: %d Time elapsed: %s mins",count,timer)
		count +=1

toc = timeit.default_timer()
timer = '%.2f' %((toc - tic)/60)
logging.info("Total years processed: %d Total time elapsed: %s mins",count,timer)



	
