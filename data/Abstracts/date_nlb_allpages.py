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
logging.basicConfig(filename='Abstracts_ZZ.log',level=logging.DEBUG)

#Use mechanize to open HTML pages
br = mechanize.Browser(factory=mechanize.RobustFactory())

#Function to cycle through range of dates in the current Year
def daterange(start_date, end_date):
    for n in range(int((end_date - start_date).days + 1)):
        yield start_date + timedelta(n)


#Function to remove headlines that are non-informative
def grepArticle(lineA):
	aa = re.search(r'\b(Masthead|Advertisements|STOP PRESS|^LATEST$|^Latest$|^Untitled$|Miscellaneous|Obituaries|Letters)\b', lineA.encode('utf-8').strip())
	if aa is None:
		return '1'
	else:
		return '0'

def grepWire(lineB):
	aa = re.search(r'\b(REUTER|UP|UPI|AP)\b', lineB.encode('utf-8').strip())
	if aa is None:
		return '1'
	else:
		return '0'


#Function to parse for headlines, page numbers and abstracts
def pageallparser(pageread):
	headlines = []
	pageno = []
	abstract = []
	correct = []
	norecord = []
	for line in pageread.findAll('a', id=re.compile('ArticleLink$')):
		headlines.append(line.getText())

	for line in pageread.findAll('div', id=re.compile('NewspaperLink$')):
		pageno.append(line.getText())

	for line in pageread.findAll('span', id=re.compile('Abstract$')):
		abstract.append(line.getText())

	if len(headlines) == len(pageno) & len(pageno) == len(abstract) & len(headlines)!=0:
		logging.info("GOOD ~ Number of Headlines, Page Numbers and Abstracts match for %s",day)
		for line in zip(headlines,pageno,abstract):
			headline = re.sub(r'\[(.*?)\]',r'',line[0])
			pageno = re.sub(r'\[(.*?)\]',r'',line[1])
			if grepArticle(headline) == '1': #and grepWire(pageno) == '1':
				#print newline
				correct.append([pageno,line[2]])
		duo = [norecord,correct]
	elif len(headlines)==0:
		logging.error("NLB record for %s does not exist",day)
		nocorrect = '909090'
		norecord.append(1)
		duo = [norecord,nocorrect]
	else:
		logging.error("ALERT! Number of Headlines/Page Numbers/Abstracts DO NOT match for %s",day)
		nocorrect = '808080'
		norecord.append(1)
		duo = [norecord,nocorrect]
	logging.info("Total %d line matches found for %s",len(correct),day)
	return duo


#Define start and end dates for the year
start_date = datetime.datetime.strptime('01/01/ZZ', '%d/%m/%Y').date()
end_date = datetime.datetime.strptime('31/12/ZZ', '%d/%m/%Y').date()


#Header for file
triplet = [['Date','Page','Abstract']]
#Write to file
with open('Abstracts_ZZ.txt', 'wb') as f:
	writer = csv.writer(f, delimiter='\t')
	writer.writerows(triplet)

#Counter for timeit
count = 0
tic = timeit.default_timer()

#Length of match array 
length = []

#Length of nomatch array
nomatch = []

#Loop through each date in the current Year
for single_date in daterange(start_date, end_date):
	single_date = single_date.isoformat().split('-')
	day = ''.join(single_date)
	#day = single_date.strftime('%Y%m%d')
	#longday = single_date.strftime('%A, %d %b %Y')
	logging.info("Finding NLB html page for The Straits Times published %s",day)
	try:
		page = br.open('http://eresources.nlb.gov.sg/newspapers/Digitised/Issue/straitstimes' + day + '-1.aspx')
	except:
		logging.warning("NLB record for %s does not exist",day)
		triplet.append([day,'909090','909090'])
		count +=1
		length.append(int(1))
	else:
		logging.info("Parsing for articles on %s",day)
		pageread =  br.response().read()
		pageread = BeautifulSoup(pageread, 'html.parser')
		#print pageread.prettify()
		correct = pageallparser(pageread)
		logging.info("Writing matches to file...")
		if len(correct[0])==0:
			length.append(int(len(correct[1])))
			for pair in correct[1]:
				bind = [day,pair[0].encode('utf-8').strip(),pair[1].encode('utf-8').strip()]
				triplet.append(bind)
				#Write to file
				with open('Abstracts_ZZ.txt', 'a') as f:
					writer = csv.writer(f, delimiter='\t')
					writer.writerows([bind])
			logging.info("Done!")
		else:
			#print correct[1]
			bind = [day,correct[1],correct[1]]
			#Write to file
			with open('Abstracts_ZZ.txt', 'a') as f:
				writer = csv.writer(f, delimiter='\t')
				writer.writerows([bind])
		count +=1
		nomatch.append(int(len(correct[0])))
	if count % 30 == 0:
		toc = timeit.default_timer()
		timer = '%.2f' %((toc - tic)/60)
		logging.info("Days processed: %d Time elapsed: %s mins",count,timer)
		

toc = timeit.default_timer()
timer = '%.2f' %((toc - tic)/60)
logging.info("Total days processed: %d Total time elapsed: %s mins",count,timer)
logging.info("Total %d rows for ZZ",numpy.sum(length))
logging.info("Total %d days with no records for ZZ",numpy.sum(nomatch))




