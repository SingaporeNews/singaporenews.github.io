library(ggplot2)
library(grid)
library(RColorBrewer)
library(gridExtra)

#theme for ggplot
theme_mine <- function(base_size = 10, base_family = "Helvetica") {
  # Starts with theme_grey and then modify some parts
  theme_grey(base_size = base_size, base_family = base_family) %+replace%
    theme(
      axis.line   	= element_line(size=0.5, colour="black"),
      #axis.line 		= element_blank(),
      #axis.line.x		= element_line(size=0.5, colour="black"),
      #axis.line.y		= element_blank(),
      plot.title		= element_text(size = 20, colour="black", face="bold"),
      strip.text.x 		= element_text(size=18, colour="black", face= "bold"),
      strip.text.y 		= element_text(size=18, face="bold", angle=90),
      strip.background 	= element_rect(colour="white", fill="#CCCCCC"),
      axis.text.x		= element_text(size = 18, colour="black"),
      #axis.text.x		= element_blank(),
      axis.text.y		= element_text(size = 18, colour="black", vjust=0.5, hjust=1),
      #axis.text.y		= element_blank(),
      axis.title.x		= element_text(size=18, colour="black"),
      #axis.title.x		= element_blank(),
      #axis.title.y		= element_blank(),
      axis.title.y		= element_text(size=18, colour="black", angle=90),
      #axis.ticks       = element_blanks(),
      axis.ticks		= element_line(colour='black'),
      legend.key        = element_blank(),
      legend.background = element_blank(),
      legend.key.size	= unit(1.5, "lines"),
      legend.text		= element_text(size= rel(1.6)),
      #legend.title		= element_text(size= rel(1.6), face="bold"),
      legend.title		= element_blank(),
      legend.position	= 'none',
      panel.background  = element_blank(),
      panel.border      = element_blank(),
      plot.background	= element_blank(),	
      panel.grid.major  = element_blank(),
      panel.grid.minor  = element_blank(),
      plot.margin		= unit(c(1.5,1.5,1.5,1.5), "lines")
    )
}

#Get decade tag on headlines
mdsh <- read.csv('MDS_headline_by_word.csv', header=F)
names(mdsh) <- c('index','head','dim1','dim2')
mdsh <- mdsh[order(mdsh$index),]
headline <- read.csv('Word_frequency_by_headline.csv', header=T)
subhead <- headline[headline$indexCol %in% mdsh$index,]
year <- c()
for (i in mdsh$index){
  year <- c(year, subhead[subhead$indexCol==i,]$yearCol[1])
}
mdsh <- cbind(year,mdsh)
mdsh$year <- paste(substr(mdsh$year,1,3),'0s',sep='')

#Plot MDS of headlines by word 
pal <- brewer.pal(6,'Set1')
mdsh_q <- mdsh[mdsh$year!='NA00s',]
hh <- ggplot(mdsh_q[sample(c(1:nrow(mdsh_q)),size=500,replace=F),])
hh1 <- hh + geom_point(aes(x=dim1,y=dim2,colour=factor(year)))
hh2 <- hh1 + theme_mine() + theme(legend.position='right')
hh3 <- hh2 + scale_colour_manual(values=pal)
hh3 + ggtitle('Multi-dimensional scaling of headlines, featurized by word tokens (6000x6488 matrix)\n_sample of 500 headlines_')

#Plot MDS of words by year
mdsw <- read.csv('MDS_word_by_year.csv', header=F)
names(mdsw) <- c('word','dim1','dim2')
jj <- ggplot(mdsw[sample(c(1:nrow(mdsw)),size=500,replace=F),])
jj1 <- jj + geom_point(aes(x=dim1,y=dim2))
jj2 <- jj1 + theme_mine() 
jj3 <- jj2 + ggtitle('Multi-dimensional scaling of words, featurized by year (2000x55 matrix)\n_sample of 500 words_\n_limit range to (-10,10)_')
jj4 <- jj3 + scale_x_continuous(limits=c(-10,10)) + scale_y_continuous(limits=c(-10,10))

kk1 <- jj + geom_text(aes(label=word,x=dim1,y=dim2))
kk2 <- kk1 + theme_mine() + scale_x_continuous(limits=c(-10,10)) + scale_y_continuous(limits=c(-10,10))

grid.arrange(jj4,kk2,ncol=1)


