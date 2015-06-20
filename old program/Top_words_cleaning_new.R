top <- read.table('Top_words_allyears_25oct.txt', header=F)
removelist <- c('new','men','man','out','off','again','all','mr.','girl',
                'i','will','back','today','more','day','home','plan','days',
                'found','go','boy','three','$5000','sir','may','new','all',
                'out','more','says','again','page','m','way','get','goes',
                'world','can','takes','dr.','dr','gets','we','woman','help','next',
                'first','take','told','must','want','do','way','one','under',
                'set','n.','under','sunday','held','untitled',
                'timescope...','weather','sections','business','special','year','fancy',
                'that...','call','Straits','times','tv','mr','report','big','\347\254\2541\351\241\265','o\302\243',
                'pts','use','soon','going','meet','should','TV','pop','make','look','straits','ST','jackpot','$10000',
                'mrs.','only','away','too')

#remove junk
top1 <-  top[!(top[,1]%in%removelist),]
top1 <- top1[grepl('^[\\w]',top1[,1],perl=T)==T,]
top2 <- top1[grepl('[;\\%]$',top1[,1],perl=T)==F,]
top3 <- top2[grepl('[A-Z]{1}',top2[,1],perl=T)==F,]

#collapse singular and plural forms
allyears <- c()

for (i in 1955:2009) {
  newmat <- c()
  temp <- top3[top3[,3]==i,]
  wordset<- unique(temp[,1])
  for (word in wordset) {
    # merge 'spore' and 'singapore' counts
    if (word =='spore'| word == 'singapore') {
      neword <- rbind(temp[temp[,1]=='spore',],
                      temp[temp[,1]=='singapore',])
      collapse <- colSums(neword[,c(2:3)])
      collapse[2][collapse[2]>2009] <- collapse[2][collapse[2]>2009]/2
      newmat[['Singapore']] <- collapse
      wordset <- wordset[!(wordset %in% c('singapore','spore'))]
    }
    # merge 'us' and 'U.S.' counts
    else if (word =='us'| word == 'u.s.') {
      neword <- rbind(temp[temp[,1]=='us',],
                        temp[temp[,1]=='u.s.',])
      collapse <- colSums(neword[,c(2:3)])
      collapse[2][collapse[2]>2009] <- collapse[2][collapse[2]>2009]/2
      newmat[['U.S.']] <- collapse
      wordset <- wordset[!(wordset %in% c('us','u.s.'))]
    }
    # merge 'sporean' and 'singaporean' counts
    else if (word =='sporean'| word == 'singaporean') {
      neword <- rbind(temp[temp[,1]=='sporean',],
                      temp[temp[,1]=='singaporean',])
      collapse <- colSums(neword[,c(2:3)])
      collapse[2][collapse[2]>2009] <- collapse[2][collapse[2]>2009]/2
      newmat[['Singaporean']] <- collapse
      wordset <- wordset[!(wordset %in% c('sporean','singaporean'))]
    }
    # merge 'cwealth' and 'commonwealth' counts
    else if (word =='cwealth'| word == 'commonwealth') {
      neword <- rbind(temp[temp[,1]=='cwealth',],
                      temp[temp[,1]=='commonwealth',])
      collapse <- colSums(neword[,c(2:3)])
      collapse[2][collapse[2]>2009] <- collapse[2][collapse[2]>2009]/2
      newmat[['Commonwealth']] <- collapse
      wordset <- wordset[!(wordset %in% c('cwealth','commonwealth'))]
    }
    # merge 'bg' and 'b-g' counts
    else if (word =='bg'| word == 'b-g') {
      neword <- rbind(temp[temp[,1]=='bg',],
                      temp[temp[,1]=='b-g',])
      collapse <- colSums(neword[,c(2:3)])
      collapse[2][collapse[2]>2009] <- collapse[2][collapse[2]>2009]/2
      newmat[['BG']] <- collapse
      wordset <- wordset[!(wordset %in% c('bg','b-g'))]
    }
    #words that do not end with 's': merge singular and plural forms, if exist
    else if (grepl('(?<!s)s$',word, perl=T)==F) {
      words <- paste(word,'s',sep='')
      neword <- rbind(temp[temp[,1]==word,],
                    temp[temp[,1]==words,])
      collapse <- colSums(neword[,c(2:3)])
      collapse[2][collapse[2]>2009] <- collapse[2][collapse[2]>2009]/2
      newmat[[word]] <- collapse
    }
    #words that end with 's': grab singular form and see if it exists. If it doesn't, its a proper word e.g. bus
    else {
      wordcut <- substr(word,1,nchar(word)-1)
      temp2 <- temp[temp[,1]==wordcut,]
      if (nrow(temp2)==0) {
        temp3 <- temp[temp[,1]==word,c(2:3)]
        newmat[[word]] <- temp3
      }
    }
  }
  istr <- as.character(i)
  allyears[[istr]] <- do.call('rbind',newmat)
}

#curated list of politically-themed words, add as necessary!
allpolitics <- c('red','marshall','talks','rubber','malaya','singapore','u.s.','war','colony',
                 'tengku','merdeka','lim','china','queen','london','tin','jakarta','rebels','alliance','visit',
                 'lee','pap','council','king','congo','ong','malaysia','merger','fund','malayan','u.n.','troops',
                 'india','sarawak','brunei','borneo','manila','razak','sultan','soekarno','chief','soek','summit',
                 'sabah','border','aid','defence','govt','indon','peace','reds','algiers','tun','ningkan','ties',
                 'us','saigon','marcos','nixon','peking','msa','britain','pact','kl','oil','price','dollar','rice',
                 'gold','exchange','thai','israel','nation','asean','harun','hussein','raja','pm','leaders','chok',
                 'tong','bg','mahathir','bush','president','un','johor','gulf','yeo','afta','sm','hk','patten','japan',
                 'apec','ramos','taiwan','suharto','sdp','asian','beijing','tang','parliament','clinton','indonesia','gus',
                 'dur','habibie','timor','deal','terror','mps','ji','iraq','cao','foreign','mm','korea','opposition','polls',
                 'thailand','myanmar','abdullah','anwar','temasek','us','up','radio','top','dow','dow ','jones','index',
                 'sgx','lrt','uob','glc','jtc','irs','ipo','ir','ioc','ceo','pas','bn','hfmd','bmw','fta','saffc','hiv','sq',
                 'tni','iso','edb','erp','imf','ny','cdcs','ge','psa','ntu','nus','dpm','nam','bt','qc','mti','coe','sm','sgh',
                 'ns','cj','wp','posb','isa','hudc','cdac','st','pc','nol','lbj','sli','ri','oas','mca','no.')

#correct forms to grab from headlines
allpoliticsCap <- c('Reds','Marshall','talks','rubber','Malaya','Singapore','U.S.','war','colony',
                    'Tengku','merdeka','Lim','China','Queen','London','tin','Jakarta','rebels','Alliance',
                    'visit','Lee','PAP','council','King','Congo','Ong','Malaysia','merger','fund','Malayan',
                    'U.N.','troops','India','Sarawak','Brunei','Borneo','Manila','Razak','Sultan','Soekarno',
                    'chief','Soek','summit','Sabah','border','aid','defence','Govt','Indon','peace','reds',
                    'Algiers','Tun','Ningkan','ties','US','Saigon','Marcos','Nixon','Peking','MSA','Britain',
                    'pact','KL','oil','price','dollar','rice','gold','exchange','Thai','Israel','nation','Asean',
                    'Harun','Hussein','Raja','PM','leaders','Chok','Tong','BG','Mahathir','Bush','President','UN',
                    'Johor','Gulf','Yeo','AFTA','SM','HK','Patten','Japan','Apec','Ramos','Taiwan','Suharto','SDP',
                    'Asian','Beijing','Tang','Parliament','Clinton','Indonesia','Gus','Dur','Habibie','Timor','deal',
                    'terror','MPs','JI','Iraq','Cao','foreign','MM','Korea','opposition','polls','Thailand','Myanmar',
                    'Abdullah','Anwar','Temasek','US','up','radio','top','Dow','Dow ','Jones','index',
                    'SGX','LRT','UOB','GLC','JTC','IRS','IPO','IR','IOC','CEO','PAS','BN','HFMD','BMW','FTA','SAFFC','HIV','SQ',
                    'TNI','ISO','EDB','ERP','IMF','NY','CDCs','GE','PSA','NTU','NUS','DPM','NAM','BT','QC','MTI','COE','SM','SGH',
                    'NS','CJ','WP','POSB','ISA','Hudc','CDAC','ST','PC','NOL','LBJ','Sli','RI','OAS','MCA','No.')

#curated list of event-themed words, add as necessary!
allevents <- c('strike','police','killed','death','fire','hurt','bandit','crash','die','bus','dies','air','pay','dead',
               'jackpot','students','govt.','flu','polio','cases','attack','plane','thugs','hunt','kidnap','bid','car',
               'airport','offer','shot','cholera','team','water','bomb','curfew','blast','kills','quote','full','row',
               'threat','heart','plea','pledge','move','moon','raid','news','down','toto','numbers','winner','wins',
               'five','draw','winning','bank','ban','mil','warning','par','haw','cut','cup','blaze','rate','kill','drug',
               'chinese','characters','tears','fun','simplified','life','quotations','sayings','mandarin','dont','green',
               'bamboo','learn','reading','hdb','road','toll','pinyin','shy','old','falls','indices','industrials',
               'components','rises','volume','sia','points','scoreboard','firms','bilingual','workers','school','good',
               'best','better','work','love','years','show','time','cpf','charged','say','case','service','tax','hit',
               'market','trade','bill','open','last','growth','paper','president','private','illegal','high','quota','system',
               'goh','scheme','rules','people','sporeans','health','schools','results','boost','telecom','gst','hits','share',
               'economic','civil','shares','flats','prices','panel','wto','upgrading','meeting','property','court','action',
               'ntuc','doctors','buy','role','food','banks','job','markets','reforms','crisis','erp','economy','imf','clob',
               'free','warns','win','sti','sing','teen','charges','dbs','group','united','jobs','wants','changes','money',
               'great','sars','virus','opportunities','law','bird','ahead','jail','family','upfront','nkf','dengue','suspect',
               'tsunami','kids','baby','haze','thaksin','record','young','public','budget','rise','face','jailed','f1','inflation',
               'costs','h1n1','credit')

#correct forms to grab from headlines
alleventsCap <- c('strike','police','killed','death','fire','hurt','bandit','crash','die','bus','dies','air','pay','dead','jackpot',
                  'students','Govt.','flu','polio','cases','attack','plane','thugs','hunt','kidnap','bid','car','airport','offer',
                  'shot','cholera','team','water','bomb','curfew','blast','kills','quote','full','row','threat','heart','plea',
                  'pledge','move','moon','raid','news','down','toto','numbers','winner','wins','five','draw','winning','bank',
                  'ban','mil','warning','Par','Haw','cut','cup','blaze','rate','kill','drug','Chinese','characters','tears','fun',
                  'simplified','life','quotations','sayings','Mandarin','dont','green','bamboo','learn','reading','HDB','road',
                  'toll','Pinyin','shy','old','falls','indices','industrials','components','rises','volume','SIA','points',
                  'scoreboard','firms','bilingual','workers','school','good','best','better','work','love','years','show','time',
                  'CPF','charged','say','case','service','tax','hit','market','trade','bill','open','last','growth','paper',
                  'president','private','illegal','high','quota','system','Goh','scheme','rules','people',"S'poreans",'health',
                  'schools','results','boost','Telecom','GST','hits','share','economic','civil','shares','flats','prices','panel',
                  'WTO','upgrading','meeting','property','court','action','NTUC','doctors','buy','role','food','banks','job',
                  'markets','reforms','crisis','ERP','economy','IMF','Clob','free','warns','win','STI','sing','teen','charges',
                  'DBS','group','united','jobs','wants','changes','money','great','Sars','virus','opportunities','law','bird',
                  'ahead','jail','family','upfront','NKF','dengue','suspect','tsunami','kids','baby','haze','Thaksin','record',
                  'young','public','budget','rise','face','jailed','F1','inflation','costs','H1N1','credit')

#check for new words to capitalize, manually amend allpolitics/allpoliticsCap/allevents/alleventsCap
allothers <- c()
for (i in 1955:2009) {
  istr <- as.character(i)
  for (str in rownames(allyears[[istr]])) {
    if (!(str %in% allpolitics))
    allothers <- c(allothers,str)
  }
}

allothers <- unique(allothers)
allothers <- allothers[!(allothers %in% allevents)]

#transfer rownames into actual column
for (i in 1955:2009) {
  istr <- as.character(i)
  temp <- allyears[[istr]]
  newtemp <- cbind('topword'=rownames(temp),temp)
  rownames(newtemp) <- NULL
  allyears[[istr]] <- newtemp
}

#append all years into matrix
allyearsmat <- do.call('rbind',allyears)

#politics <- allyearsmat[allyearsmat$topword %in% c(allpolitics,'red'),]
#events <- allyearsmat[allyearsmat$topword %in% allevents,]

#convert proper nouns to correct forms
for (i in 1:length(allpolitics)) {
  allyearsmat$topword <- apply(allyearsmat, 1, function(x) {if(x['topword'] %in% allpolitics[i]) y <- allpoliticsCap[i] else y <- x['topword']})
}

for (i in 1:length(allevents)) {
  allyearsmat$topword <- apply(allyearsmat, 1, function(x) {if(x['topword'] %in% allevents[i]) y <- alleventsCap[i] else y <- x['topword']})
}

#Add decade
decader <- function(x){
  if(x[3]<1960)
    gg <- '1950s'
  else if(x[3]<1970)
    gg <- '1960s'
  else if(x[3]<1980)
    gg <- '1970s'
  else if(x[3]<1990)
    gg <- '1980s'
  else if(x[3]<2000)
    gg <- '1990s'
  else 
    gg <- '2000s'
}

#politics[,4] <- apply(politics,1,decader)
#events[,4] <- apply(events,1,decader)

#transpose
library(reshape2)

names(allyearsmat) <- c('topword','freq','year')
aym <- dcast(allyearsmat, year ~ topword, value.var='freq')
aym[is.na(aym)] <- 0

#Write to file
write.csv(allyearsmat[,c(1,3,2)],'Words_allyears_caps_27oct.csv',quote=F,row.names=F)
write.csv(aym, 'transposed_terms_caps_27oct.csv',quote=F,row.names=F)
