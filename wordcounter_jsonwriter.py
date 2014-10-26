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

################################################################################################
#Script to:
#1) Count top 50 words from each year's headlines, using only nouns, verbs and adjectives
#2) Grab headlines associated with top words and convert to json
################################################################################################

#Write process to a log file
logging.basicConfig(filename='Freq_analysis.log',level=logging.DEBUG)
logging.info('Starting frequency analysis for Straits Times headlines 1955-2009')

#Timer
tic = timeit.default_timer()

####################################
#A) Obtain stoplist via PoS tagging
####################################

#corpus of all headlines, unvectorized, lowercase, by year (RETAIN FOR TERM-YEAR MATRIX, PART B)
allcurrent = []
#corpus of all headlines, unvectorized, original, by year (RETAIN FOR GRABBING HEADLINES, PART E)
allhead = []
#PoS-tagged headlines
alltagged = []


#Cycle through each year's headlines
#######################################################################
#Ignore TypeError: not all arguments converted during string formatting
#######################################################################
count = 1
for year in range(1955,2010):
	#unvectorized headlines for current year, for tagging
	currentstring = []
	#unvectorized headlines for current year, lowercase
	current = []
	#unvectorized headlines for current year, original
	head = []
	logging.info('Reading headlines for %d...', year)
	with open('Headlines_' + str(year) + '.txt') as f:
		for x in f.readlines()[1:]:
			x = re.sub(r'\xe2\x80\x93|\xe2\x80\x94|\xc3\x82|\xe2\x80\xa2|\xc2\xa75|14\xbd|\0xc2', r' ', x)
			if re.search(r'\b(miscellaneous|am latest|highlights|section|pages|stop press|latest)\b', x) is None:
				x0 = x.strip('\r\n').split('\t')
				head.append(x0[1])
				x1 = re.sub(r'([()?:!,\'])', r'', x)
				#remove non-informative headlines
				xx = x1.strip('\r\n').split('\t')
				xy = xx[1].lower()
				currentstring.append(xy.decode('utf-8'))
				current.append(xy)
		logging.info('Converted %d headlines to bag-of-words', year)

		#Tag unvectorized headlines
		logging.info('PoS tagging %d headlines...', year)
		tokens = [nltk.word_tokenize(headline) for headline in currentstring]
		tagged = [nltk.pos_tag(token) for token in tokens]
		alltagged.append(tagged)
		allcurrent.append(current)
		allhead.append(head)
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

#############################################
#B) Get term-year matrix, excluding stopwords
#############################################

yeardoc =[]
for current in allcurrent:
	newcurrent = ' '.join(current)
	yeardoc.append(newcurrent)
vec = CountVectorizer(stop_words=stoplistw)
termyear = vec.fit_transform(yeardoc)
df = pandas.DataFrame(termyear.toarray().transpose(), index = vec.get_feature_names())
df.columns = range(1955,2010)

#remove numeric word elements
index = vec.get_feature_names()
indexi = [y for y in index if re.search(r'[0-9]|_',y) is None]
df2 = df.ix[indexi]
#write to file
df2.to_csv('term_by_year_15oct.csv', sep=',')

############################################################
#C) Count top 50 words by year, excluding those in stoplist
############################################################

#load stoplist
stoplistw = pickle.load(open('stoplistw.sp','rb'))

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
				#dateindex.append(headlines[0])
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

#########################################
#D) DATA CLEANING AND CURATION STEP IN R
#########################################

##########################################################
#E) Grab headlines for top words in events, politics sets
##########################################################

with open('Top_words_events_24oct.txt') as f:
	curated = [x.strip().split('\t') for x in f.readlines() if x]

#numpy array to subset by column
ncurated = numpy.array(curated)

#Function to grab headlines according to word
def grepWord(word,headlinelist):
	hits =[]
	for headline in headlinelist:
		wordsub = re.sub('\$',r'\$',word)
		wordsub = re.sub('\.',r'\.',wordsub)
		my_regex = r'\b' + wordsub + r'\b' 
		aa = re.search(my_regex, headline, re.IGNORECASE)
		if aa is not None:
			hits.append(headline)
	return hits

def grepWordSpore(word,headlinelist):
	hits = []
	for headline in headlinelist:
		aa = re.search(r'\b(Singapore|S\'pore)\b', headline, re.IGNORECASE)
		if aa is not None:
			hits.append(headline)
	return hits

#Create list of parent,child tuples by year
#######################################
#Depends on list 'allhead' from Part A
#######################################

linksall = []
for year,head in zip(range(1955,2010),allhead):
	links = []
	yearcur = ncurated[ncurated[:,2] == str(year)].tolist()
	n = 1
	for word in yearcur:
		logging.info('looking for word #%d in %d',n,year)
		if word[0] == 'Singapore':
			hlist = grepWordSpore(word[0],head)
		else:
			hlist = grepWord(word[0],head)
		if len(hlist) > 10:
			#decade,year
			links.append((word[3],int(year)))
			#year,word
			links.append((int(year),word[0]))
			#word,frequency
			links.append((word[0],int(word[1])))
			ind = random.sample(range(0,len(hlist)-1),10)
			for i in ind:
				#word, headline
				links.append((word[0],hlist[i]))
		elif len(hlist) > 0:
			links.append((word[3],int(year)))
			links.append((int(year),word[0]))
			links.append((word[0],int(word[1])))
			for i in range(0,len(hlist)-1):
				links.append((word[0],hlist[i]))
		n +=1
	logging.info('Year %d done!',year)
	linksall.append(links)

#Function to get correct child for parent: Year>word>headline
def get_nodes(node,links):
	d = {}
	d['name'] = node
	children = [x[1] for x in links if x[0] == node and isinstance(x[1],int) is False]
	childrenint = [x[1] for x in links if x[0] == node and isinstance(x[1],int) is True]
	#size element
	if len(childrenint) == 1:
		#logging.info('Starting level WORD in hierarchy...')
		d['size'] = str(childrenint[0])
		d['headlines'] = [get_nodes_h(child) for child in children]
	elif children:
		#logging.info('Starting level YEAR in hierarchy...')
		d['children'] = [get_nodes(child,links) for child in children]
	return d

def get_nodes_h(node):
	d = {}
	d['name'] = node
	return d

#create year>word>headline hierarchy
tree = []
n = 1955
for links in linksall:
	node = n
	subtree = get_nodes(node,links)
	tree.append(subtree)
	n +=1


#Attach decade parent
e50s = {}
e50s['name'] = '1950s'
e50s['children'] = tree[0:5]

e60s = {}
e60s['name'] = '1960s'
e60s['children'] = tree[5:15]

e70s = {}
e70s['name'] = '1970s'
e70s['children'] = tree[15:25]

e80s = {}
e80s['name'] = '1970s'
e80s['children'] = tree[25:35]

e90s = {}
e90s['name'] = '1970s'
e90s['children'] = tree[35:45]

e00s = {}
e00s['name'] = '1970s'
e00s['children'] = tree[45:55]

#root parent
e = {}
e['name'] = 'root'
e['children'] = [e50s,e60s,e70s,e80s,e90s,e00s]

#write to file
with open('Words_events_decade_15oct.json', 'wb') as g:
	json.dump(e,g,indent=5)

	