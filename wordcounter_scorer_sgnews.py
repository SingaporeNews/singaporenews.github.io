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
from gensim import corpora, models, similarities
from nltk.util import ngrams 
from datetime import timedelta
from time import strftime
from sklearn.feature_extraction.text import CountVectorizer 

################################################################################################
#Script to count top 50 words from each year's headlines, using only nouns, verbs and adjectives
################################################################################################

#Write process to a log file
logging.basicConfig(filename='Freq_analysis.log',level=logging.DEBUG)
logging.info('Starting frequency analysis for Straits Times headlines 1955-2009')

#Timer
tic = timeit.default_timer()

#################################
#Obtain stoplist via PoS tagging
#################################

#corpus of all headlines, unvectorized, by year
allcurrent = []
#PoS-tagged headlines
#alltagged = []

##Cycle through each year's headlines
count = 1
for year in range(1955,2010):
	#unvectorized headlines for current year, for tagging
	currentstring = []
	#unvectorized headlines for current year
	current = []
	logging.info('Reading headlines for %d...', year)
	with open('Headlines_' + str(year) + '.txt') as f:
		for x in f.readlines()[1:]:
			x = re.sub(r'\xe2\x80\x93|\xe2\x80\x94|\xc3\x82|\xe2\x80\xa2|\xc2\xa75|14\xbd|\0xc2', r' ', x)
			x = re.sub(r'([()?:!,\'])', r'', x)
			#remove non-informative headlines
			if re.search(r'\b(miscellaneous|am latest|highlights|section|pages|stop press|latest)\b', x) is None:
				xx = x.strip('\r\n').split('\t')
				xy = xx[1].lower()
				currentstring.append(xy.decode('utf-8'))
				current.append(xy)
		logging.info('Converted %d headlines to bag-of-words', year)

		#Tag unvectorized headlines
		#logging.info('PoS tagging %d headlines...', year)
		#tokens = [nltk.word_tokenize(headline) for headline in currentstring]
		#tagged = [nltk.pos_tag(token) for token in tokens]
		#alltagged.append(tagged)
		allcurrent.append(current)
		logging.info('Done!', year)

		#Counter for timer
		if count % 10 == 0:
			toc = timeit.default_timer()
			timer = '%.2f' %((toc - tic)/60)
			logging.info("Years processed: %d Time elapsed: %s mins",count,timer)
		count +=1

newtagged = []
#vectorize all word,tag tuples for the year
for tagged in alltagged:
	itag = itertools.chain.from_iterable(tagged)
	tag = list(itag)
	newtagged.append(tag)

#only retain nouns, verbs, adjectives; create stoplist
keeptags =['NN','NNS','NNP','NNPS','VB','VBD','VBG','VBN','VBP','VBZ','JJ','JJR','JJS']
alltags = list(itertools.chain.from_iterable(newtagged))

stopset = list(set([word.encode('utf-8') for (word,tag) in alltags if tag not in keeptags]))
keepset = list(set([word.encode('utf-8') for (word,tag) in alltags if tag in keeptags]))
finalset = [y for y in stopset if y not in keepset]

#additional prepositions to remove; may have been in keepset 
stoplist = list('for a at of the and to in is was are were with it on be by but or from its have has that this as who sa ys mala ya'.split())

for y in finalset:
	stoplist.append(y)

stoplistw = set(stoplist)

#May want to pickle stoplistw
with open('stoplistw.sp', 'wb') as h:
	pickle.dump(stoplistw, h)

###########################################
#Get term-year matrix, excluding stopwords
###########################################

yeardoc =[]
for current in allcurrent:
	newcurrent = ' '.join(current)
	yeardoc.append(newcurrent)
vec = CountVectorizer(stop_words=stoplistw)
termyear = vec.fit_transform(yeardoc)
df = pandas.DataFrame(termyear.toarray().transpose(), index = vec.get_feature_names())
df.columns = range(1955,2010)
#write to file
df.to_csv('term_by_year_15oct.csv', sep=',')

#########################################################
#Count top 50 words by year, excluding those in stoplist
#########################################################

#most common words per year
allfreq = []

#Cycle through each year's headlines
count = 1
for year in range(1955,2010):
	current = []
	logging.info('Reading headlines for %d...', year)
	with open('Headlines_' + str(year) + '.txt') as f:
		for x in f.readlines()[1:]:
			x = re.sub(r'\xe2\x80\x93|\xe2\x80\x94|\xc3\x82|\xe2\x80\xa2|\xc2\xa75|14\xbd', r' ', x)
			x = re.sub(r'([()?:!,\'])', r'', x)
			x = x.lower()
			if re.search(r'\b(miscellaneous|am latest|highlights|section|pages|stop press|latest)\b', x) is None:
				headlines = x.split()
				#vectorize headlines
				current.append([y for y in headlines[1:] if y not in stoplistw])
				#yearindex.append(headlines[0][0:4])
		logging.info('Converted %d headlines to bag-of-words', year)

		#Index of words for the year; remove words if they are unique 
		icur_bag = itertools.chain.from_iterable(current)
		cur_bag = list(icur_bag)
		logging.info('Removing unique words..')
		tokens_once = set(word for word in set(cur_bag) if cur_bag.count(word) == 1)
		goodcur_bag = [word for word in cur_bag if word not in tokens_once]	

		#Count 50 most common words
		logging.info('Extracting 100 most common words for %d..', year)
		counter = collections.Counter(goodcur_bag)
		freq = counter.most_common(50)
		lfreq = [list(y) for y in freq]
		allfreq.append(lfreq)
		logging.info('Done!')

		#Counter for timer
		if count % 10 == 0:
			toc = timeit.default_timer()
			timer = '%.2f' %((toc - tic)/60)
			logging.info("Years processed: %d Time elapsed: %s mins",count,timer)
		count +=1

#Total time
toc = timeit.default_timer()
timer = '%.2f' %((toc - tic)/60)
logging.info("Total years processed: %d Time elapsed: %s mins",count-1,timer)

#Write top 50 words to file
n = 1955
for freq in allfreq:
	for word in freq:
		word.append(str(n))
		with open('Top_words_allyears_15oct.txt','a') as h:
			writer = csv.writer(h, delimiter='\t')
			writer.writerows([word])
	n +=1




	