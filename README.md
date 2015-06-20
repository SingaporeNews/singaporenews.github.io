The Singapore News Story 
=======================

This repository is an entry for the [Data In The City Visualization Challenge](https://ideas.ecitizen.gov.sg/a/pages/visualisationchallenge-home) organized by the Info-communications Development Authority (IDA) of Singapore.

> The "Data in the City" Data Visualisation Challenge invites the public to celebrate the 50th anniversary (SG50) 
by telling the Singapore Story using data and visualise how we live, work and play in Singapore. It is an excellent opportunity to commemorate the country's amazing progress and celebrate the best that is yet to come."

The Singapore News Story presents data visualizations of over 50 years of news headlines from Singapore's most prominent English daily, The Straits Times. You can see the site at [singaporenews.github.io](singaporenews.github.io). All of the code used in the collection, analysis and visualization of the data (in addition to the code for the site itself) is available in this repository. The project is meant to be entirely reproducible and extensible. If you have any questions or if you'd like to contribute, please email Paul (meinshap@gmail.com) or Hanif (hanif.samad.sg@gmail.com). 

### Data
We used the portal [NewspaperSG](http://eresources.nlb.gov.sg/newspapers/) containing digitised newspaper archives and maintained by the National Library Board as our primary source of data. The focus of our project was on Page 1 headlines from the Straits Times, which we extracted by identifying the appropriate html tags in the source page (it should be mentioned that the portal archives many other newspapers including [community language newspapers](http://eresources.nlb.gov.sg/newspapers/Digitised/Issue/nysp19550101-1.aspx) and [rare out-of-print dailies](http://eresources.nlb.gov.sg/newspapers/Digitised/Issue/singfreepressb19400101-1.aspx), which could be interesting sources of further analysis). [Here](http://eresources.nlb.gov.sg/newspapers/Digitised/Issue/straitstimes19550101-1.aspx) is an example of a digitised Straits Times record, taken from the January 1st 1955 issue. 

The code for scraping the headlines, agnostic to year, is written in Python and is called [date_nlb.py](https://github.com/SingaporeNews/singaporenews.github.io/blob/master/data/date_nlb.py), found in the folder [old program](https://github.com/SingaporeNews/singaporenews.github.io/tree/master/old program). Replace 'ZZ' in the code with any year of interest. This makes it possible to run multiple years in parallel covering any time period between 1845 and 2009. A log file 'Headlines_(year).log' is produced that records integrity checks on the process, making sure that there is a one-to-one correspondence between page tag and headline.
Non-informative headlines (e.g. 'Latest', Miscellaneous') are also removed at this step.

###**Extended version
As of 20 June 2015, we are currently working on extending the visualization to cover a richer data source. Instead of just Page 1 headlines, we are working on 50-word abstracts encompassing all available years in NewspaperSG (1845-2009). The relevant code for this extension is [date_nlb_allyears.py](https://github.com/SingaporeNews/singaporenews.github.io/blob/master/data/date_nlb_allyears.py) and can be found in the folder [program](https://github.com/SingaporeNews/singaporenews.github.io/tree/master/program).

### Visualizations

### the Site
