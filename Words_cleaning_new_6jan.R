setwd('/Users/hanif/Desktop/singaporenews.github.io/analysis/')
ww <- read.csv('Word_tag_frequency.csv', header=F)
#Take only adjectives, nouns, verbs
ww$grep <- grepl('JJ|NN|VB', ww$V3)
w0 <- ww[ww$grep=='TRUE',c(2,1,4)]
names(w0) <- c('wordCol','yearCol','countCol')

#Remove punctuated words and numbers
w0$punct <- grepl('\\.|-|\\*|\\\\|\\^|_|[0-9]',w0$wordCol)
w0$us <- grepl('u\\.s\\.',w0$wordCol)
w0 <- w0[w0$punct=='FALSE' | w0$us=='TRUE',c(1:3)]

#Remove single letters
w0$nchar <- nchar(as.character(w0$wordCol))
w0 <- w0[w0$nchar>1,c(1:3)]

#Remove conjunctions
removetags <- c('is','was','are','were','be','go','do','has','had','have','goes','pore')
w0 <- w0[!(w0$wordCol %in% removetags),]

write.csv(w0, 'Words_allyears_6jan15.csv', row.names=F)

#Read in headlines
w1 <- read.csv('Words_all_headlines_6jan15.csv', header=T)
#Cast into wide format, remove crap
w3 <- dcast(w1, yearCol~wordCol, value.var='wordCol')
dross <- names(w3)[2:85]
w3 <- w3[,!(names(w3) %in% dross)]
write.csv(w3, 'transposed_terms_6jan15.csv', row.names=F)

#Remove dross from headlines
w1 <- w1[!(w1$wordCol %in% dross),]
write.csv(w1, 'transposed_terms_6jan15.csv', row.names=F)


