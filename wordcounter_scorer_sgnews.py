from __future__ import with_statement
import itertools
import collections
import numpy
import datetime
import timeit
import logging
import csv
import re
import pandas
from gensim import corpora, models, similarities
from nltk.util import ngrams 
from datetime import timedelta
from time import strftime
from sklearn.feature_extraction.text import CountVectorizer 

#Write process to a log file
logging.basicConfig(filename='Freqsim_analysis.log',level=logging.DEBUG)
logging.info('Starting frequency and similarity analysis for Straits Times headlines 1955-2009')

#Timer
tic = timeit.default_timer()

#Frequency analysis: bag-of-words (nltk)
#Similarity analysis: Latent semantic analysis (gensim)

##declare arrays for collection of 
#most common words per year
allfreq = []
#corpus of all headlines, vectorized
allhead = []
#corpus of all headlines, unvectorized
allcurrent = []
#index of year to each headline
yearindex = []
#list of prepositions to remove
stoplist = set('for a at of the and to in is was are were with it on be by but or from its have has that this as who sa ys mala ya'.split())

##Function to grep headlines containing most common words, grep associated score
def grepPattern(pattern,wordlist):
	hits = []
	for word in wordlist:
		patternsub = re.sub('\$',r'\$',pattern)
		aa = re.search(patternsub, word)
		if aa is None:
			hits.append(0)
		else:
			hits.append(1)
	hitsum = numpy.sum(hits)
	return hitsum

##Cycle through each year's headlines
count = 1
for year in range(1955,2010):
	current = []
	currentstring = []
	logging.info('Reading headlines for %d...', year)
	with open('Headlines_' + str(year) + '.txt') as f:
		for x in f.readlines()[1:]:
			x = re.sub(r'\xe2\x80\x93|\xe2\x80\x94|\xc3\x82|\xe2\x80\xa2|\xc2\xa75|14\xbd', r' ', x)
			x = re.sub(r'([()?:!,\'])', r'', x)
			x = x.lower()
			if re.search(r'\b(miscellaneous|am latest|highlights|section|pages|stop press)\b', x) is None:
				xx = x.strip('\r\n').split('\t')
				#print xx[1]
				currentstring.append(xx[1])
				headlines = x.split()
				#vectorize headlines
				#word = ngrams([y for y in headlines[1:] if y not in stoplist], 2)
				current.append([y for y in headlines[1:] if y not in stoplist])
				#word = ngrams([y for y in headlines[1:] if y not in stoplist], 2)
				#allhead.append([' '.join(y) for y in word])
				allhead.append([y for y in headlines[1:] if y not in stoplist])
				yearindex.append(headlines[0][0:4])
		logging.info('Converted %d headlines to bag-of-words', year)

		#Append unvectorized headlines
		allcurrent.append(currentstring)

		#Index of words for the year; remove words if they are unique 
		icur_bag = itertools.chain.from_iterable(current)
		cur_bag = list(icur_bag)
		logging.info('Removing unique words..')
		tokens_once = set(word for word in set(cur_bag) if cur_bag.count(word) == 1)
		goodcur_bag = [word for word in cur_bag if word not in tokens_once]

		#Count 50 most common words
		logging.info('Extracting 50 most common words for %d..', year)
		counter = collections.Counter(goodcur_bag)
		freq = counter.most_common(50)
		allfreq.append([list(y) for y in freq])
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
		with open('Top_words_allyears.txt','a') as h:
			writer = csv.writer(h, delimiter='\t')
			writer.writerows([word])
	n +=1

#Write vectorized headlines to file
with open('Headlines_corpuswords_1955_2009.txt', 'wb') as h:
	writer = csv.writer(h, delimiter='\t')
	writer.writerows(allhead)

#Term-year matrix
yeardoc =[]
for current in allcurrent:
	newcurrent = ' '.join(current)
	yeardoc.append(newcurrent)
vec = CountVectorizer(min_df=0.2,stop_words='english')
termyear = vec.fit_transform(yeardoc)
df = pandas.DataFrame(termyear.toarray().transpose(), index = vec.get_feature_names())
df.columns = range(1955,2010)
#write to file
df.to_csv('term_by_year.csv', sep=',')





	