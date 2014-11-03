from __future__ import with_statement
from bs4 import BeautifulSoup
#import lxml
import mechanize
import datetime
import logging
import re
import csv
import timeit
import numpy
from datetime import timedelta
from time import strftime

#Write process to a log file
logging.basicConfig(filename='Headlines_ZZ.log',level=logging.DEBUG)

#Use mechanize to open HTML pages
br = mechanize.Browser(factory=mechanize.RobustFactory())

#Function to cycle through range of dates in the current Year
def daterange(start_date, end_date):
    for n in range(int((end_date - start_date).days + 1)):
        yield start_date + timedelta(n)


#Function to remove Page 1 headlines that are non-informative
def grepPattern(lineA):
	aa = re.search(r'\b(Masthead|Advertisements|STOP PRESS|^LATEST$|^Latest$|^Untitled$|Miscellaneous)\b', lineA.encode('utf-8').strip())
	if aa is None:
		return '1'
	else:
		return '0'

#Function to parse for Page 1 headlines only
def pageoneparser(pageread):
	headlines = []
	pageno = []
	correct = []
	length = []
	for line in pageread.findAll('a', id=re.compile('ArticleLink$')):
		headlines.append(line.getText())

	for line in pageread.findAll('div', id=re.compile('NewspaperLink$')):
		pageno.append(line.getText())
	
	if len(headlines) != len(pageno):
		logging.error("ALERT! Number of Headlines and Page Numbers DO NOT match for %s",day)
		correct = '909090'
	else:
		logging.info("GOOD ~ Number of Headlines and Page Numbers match for %s",day)
		for line in zip(headlines,pageno):
			newline = re.sub(r'\[(.*?)\]',r'',line[0])
			if line[1] == 'Page 1' and grepPattern(newline) == '1':
				#print newline
				correct.append(newline)
	logging.info("Total %d line matches found for %s",len(correct),day)
	return correct


#Define start and end dates for the year
start_date = datetime.datetime.strptime('01/01/ZZ', '%d/%m/%Y').date()
end_date = datetime.datetime.strptime('31/12/ZZ', '%d/%m/%Y').date()


#Header for file
pair = [['Date','Headline']]
#Write to file
with open('Headlines_ZZ.txt', 'wb') as f:
	writer = csv.writer(f, delimiter='\t')
	writer.writerows(pair)

#Counter for timeit
count = 0
tic = timeit.default_timer()

#Length of match array 
length = []

#Loop through each date in the current Year
for single_date in daterange(start_date, end_date):
	day = single_date.strftime('%Y%m%d')
	longday = single_date.strftime('%A, %d %b %Y')
	logging.info("Finding NLB html page for The Straits Times published %s",longday)
	try:
		page = br.open('http://eresources.nlb.gov.sg/newspapers/Digitised/Issue/straitstimes' + day + '-1.aspx')
	except:
		logging.warning("NLB record for %s does not exist",longday)
		pair.append([day,'909090'])
		count +=1
		length.append(int(1))
	else:
		logging.info("Parsing for Page 1 headlines on %s",longday)
		pageread =  br.response().read()
		pageread = BeautifulSoup(pageread, 'html.parser')
		#print pageread.prettify()
		correct = pageoneparser(pageread)
		logging.info("Writing matches to file...")
		for i in correct:
			bind = [day,i.encode('utf-8').strip()]
			pair.append(bind)
			#Write to file
			with open('Headlines_ZZ.txt', 'a') as f:
				writer = csv.writer(f, delimiter='\t')
				writer.writerows([bind])
		logging.info("Done!")
		count +=1
		length.append(int(len(correct)))
	if count % 30 == 0:
		toc = timeit.default_timer()
		timer = '%.2f' %((toc - tic)/60)
		logging.info("Days processed: %d Time elapsed: %s mins",count,timer)
		

toc = timeit.default_timer()
timer = '%.2f' %((toc - tic)/60)
logging.info("Total days processed: %d Total time elapsed: %s mins",count,timer)
logging.info("Total %d rows for ZZ",numpy.sum(length))




