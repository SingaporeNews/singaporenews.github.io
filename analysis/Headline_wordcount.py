from __future__ import with_statement
import itertools
import csv
import re
import nltk
import logging

logging.basicConfig(filename='Summary_stats.log',level=logging.DEBUG)


for year in range(1955,2010):
	logging.info('Reading headlines for %d...', year)
	with open('Headlines_' + str(year) + '.txt') as f:
		n = 1
		for x in f.readlines()[1:]:
			x = re.sub(r'\xe2\x80\x93|\xe2\x80\x94|\xc3\x82|\xe2\x80\xa2|\xc2\xa75|14\xbd|\0xc2', r' ', x)
			if re.search(r'\b(miscellaneous|am latest|highlights|section|pages|stop press|latest)\b', x) is None:
				x0 = x.strip('\r\n').split('\t')
				nwords = len((x0[1].split()))
				x0.append(nwords)
				with open('Headlines_1955_2009_wordcount.txt', 'a') as g:
						writer = csv.writer(g, delimiter='\t')
						writer.writerows([x0])
				logging.info('Headline #%d done', n)
				n +=1
		logging.info('Year %d done!', year)




	


