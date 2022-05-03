library(openxlsx)
library(readxl)

# download 'National and/or State Level Monthly and/or Annual Data' zip file from USDA
# listed at https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap
#
# make a tempfile
temp <- tempfile()
# download the zipfile
# likely need to update/verify the zip url
download.file("https://www.fns.usda.gov/sites/default/files/resource-files/SNAPZip69throughCurrent-4.zip",temp)
# peep the file list
unzip(temp, list = TRUE)
# unzip to dir of choice (ideally named after zip file)
unzip(temp, files = NULL, list = FALSE, overwrite = TRUE,
      junkpaths = FALSE, exdir = "SNAPZip69throughCurrent-4",)
unlink(temp)
# review files of interest in dir
list.files("SNAPZip69throughCurrent-4/", pattern = "FY")
# get path of FY prefix files in all folder of working directory
# regex gets files starting with FY and ending with .xls
file.list <- list.files(pattern = '^FY.*xls', recursive = TRUE)
print(file.list)
# read in 'WRO' sheet of each file as list, using openxlsx::readxlsx
df.list <- lapply(file.list, function(x) read_excel(x, sheet = "WRO"))
# make a function to clean up each of the sheets
processFY = function(z) {
  names(z) <- z[3,]
  names(z)[1] <- "Date"
  # remove rows
  z <- z[-c(1:4),] #%>% View()
  # get rownums for HI data
  start <- which(z$Date == "Hawaii") + 1
  end <- which(z$Date == "Hawaii") + 12
  # filter to only rows wanted
  z <- z[start:end,]
  print(head(z))
  return(z)
}
# use the function over the entire file list
zs <- lapply(df.list, processFY)
# realize that in 2015 the data began a new structure...
zs[16:23]
# make a function to move and rename cols
cleanupFY = function(z){
  z <- z[, c(1, 2, 3, 5, 6, 4)]
  names(z) <- names(zs[[1]])
  print(head(z))
  return(z)
}
# store final output with FYs '00-'14, '89-'99, and moved/renamed '15-'22 as new variable
zs <- bind_rows(c(zs[c(1:15,24:34)], #FYs '00-'14, '89-'99
                   lapply(zs[16:23], cleanupFY)), # run cleanup function on list for FY '15-'22
                 .id = "from_file") # store all with new col including filename
View(zs)

# setting col types 
# Dates
# for FY19 Jan/Feb have the following footnote: 
# 2. Due to the partial Federal government shutdown, 
# most of the February 2019 SNAP benefits were issued early in the month of January 2019.
# This was done to ensure SNAP recipients would receive their February 2019 benefits in a timely manner.
# As a result, January 2019's benefits will show a significant increase over the previous month and February 2019's benefits will show significantly less than January 2019.					
# 
# also, since no day is given, need to use zoo package
library(zoo)

zs$Date <- as.yearmon( # use zoo::yearmon
  strtrim(zs$Date, 8), # trim zs$Date to remove '/2' footnote on FY19's Jan & Feb
  "%b %Y") %>% # define format of 'Jan 2000' type date
  as.Date # convert to date R can handle

zs$Household <- as.integer(zs$Household) # Households to int
zs$Persons <- as.integer(zs$Persons) # Persons to int
zs$`Per Household` <- round(as.numeric(zs$`Per Household`),2) # Per household cost to int
zs$`Per Person` <- round(as.numeric(zs$`Per Person`),2) # Per person cost to int
zs$Cost <- as.integer(zs$Cost)

# remove incomplete rows (most recent file contains empty rows for remaing FY months)
zs <- zs[complete.cases(zs), ]

# save output
write.csv(zs %>% select(-from_file), "SNAP FY 89-22.csv", row.names = F)

rm(temp, file.list, df.list, processFY, cleanupFY)


zs[complete.cases(zs), ]


