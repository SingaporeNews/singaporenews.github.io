head <- read.table('Headlines_1955_2009_wordcount.txt', header=F, sep='\t')
names(head) <- c('Date','Headline','Wordcount')
head$Date <- strptime(head$Date, '%Y%m%d')
head$Month <- strftime(head$Date, '%m')
head$Year <- strftime(head$Date, '%Y')
head$Decade <- as.factor(paste(substr(head$Year,1,3),'0s',sep=''))

library(data.table)

headt <- data.table(head)
month <- headt[,list(mean(Wordcount),count=.N),
               by=list(Decade,Month)]
year <- headt[,list(mean(Wordcount),count=.N),
              by=list(Decade,Year)]
decade <- headt[,list(mean(Wordcount),avcount=.N/10),
                by=Decade]
monthlist <- factor(month$Month, labels=c('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'))

library(ggplot2)
library(RColorBrewer)
library(gridExtra)

pal <- brewer.pal(6,'Set1')
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

#Histogram of wordcount
aa <- ggplot(head)
aa1 <- aa + geom_bar(aes(x=Wordcount), fill='grey', stat='bin')
aa2 <- aa1 + theme_mine() + scale_x_continuous(expand=c(0,0)) + scale_y_continuous(expand=c(0,0))
aa3 <- aa2 + ggtitle('Histogram of wordcount, all headlines') + ylab('Frequency') + xlab('Wordcount')

#Average no. of words by year
bb <- ggplot(year)
bb1 <- bb + geom_bar(aes(x=Year,y=V1), fill='#0000CC', stat='identity')
bb2 <- bb1 + theme_mine() + scale_x_discrete(breaks=c(seq(1955,2009,5),2009)) + scale_y_continuous(expand=c(0,0))
bb3 <- bb2 + ylab('Average length') + ggtitle('Average no. of words in headlines, by year')

#Total no. of words by year
cc1 <- bb + geom_bar(aes(x=Year,y=count), fill='#990000', stat='identity')
cc2 <- cc1 + theme_mine() + scale_x_discrete(breaks=c(seq(1955,2009,5),2009)) + scale_y_continuous(expand=c(0,0))
cc3 <- cc2 + ylab('Frequency') + ggtitle('Total no. of headlines, by year')

#Average no. of words by month and decade
month$Decade <- as.factor(month$Decade)
dd <- ggplot(month,aes(group=Decade))
dd1 <- dd + geom_line(aes(x=monthlist,y=V1,colour=Decade), size=0.8)
dd2 <- dd1 + theme_mine() + theme(legend.position=c(0.8,0.3)) + scale_y_continuous(expand=c(0,0), limits=c(0,6.5)) + scale_colour_manual(values=pal)
dd3 <- dd2 + xlab('Month') + ylab('Average length') + ggtitle('Average no. of headlines, by month and decade')

#Total no.of words by month and decade
ee <- ggplot(month,aes(group=Decade))
ee1 <- ee + geom_bar(aes(x=monthlist,y=count,fill=Decade), position='stack', stat='identity')
ee2 <- ee1 + theme_mine() + theme(legend.position='right') + scale_y_continuous(expand=c(0,0)) + scale_fill_manual(values=pal)
ee3 <- ee2 + xlab('Month') + ylab('Frequency') + ggtitle('Total no. of headlines, by month and decade')

#Plot all charts
grid.arrange(aa3,bb3,cc3,dd3,ee3, ncol=2)
