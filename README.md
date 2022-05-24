# Compiling and Sharing SNAP Data for Hawaii

## Federal Data

### Statewide Monthly Data, FY89-FY22
FY69-FY22 data is shared as a .zip file containing numerous .xls files. 
The dataset covers *Persons, Households, Benefits, and Average Monthly Benefit per Person & Household*, however from 1969-1988 data are only availably at the national level. 
Thus, Hawaii data for FY89-FY22 within these files has been compiled and is now available as:

- Data: Date, Households, Persons, Average Monthly Benefit Per Household, Average Monthly Benefit Per Person, Benefits
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/Statewide%20Monthly%20SNAP%20FY%2089-22.csv)
- [Tableau visualization](https://public.tableau.com/shared/R27B9YKPC?:display_count=n&:origin=viz_share_link)
- Source Data: [USDA FNS SNAP Data Tables](https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap) “National and/or State Level Monthly and/or Annual Data”

### County Level Bi-Annual Data, FY89-Jan21
January and July *Participation and Issuance Data* for FY89 through January 2021.
The January and July data is reported to FNS in May and Dec. respectively.

- Data: County, SNAP All Persons Public Assistance Participation, SNAP All Persons Non-Public Assistance Participation, Calc: SNAP Total PA and Non-PA People, SNAP All Households Public Assistance Participation, SNAP All Households Non-Public Assistance Participation, Calc: SNAP Total PA and Non-PA Households, SNAP All Total Actual PA & Non-PA Issuance, Date
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/County%20Bi-Annual%20SNAP%2089-21.csv)
- [Tableau visualization](https://public.tableau.com/shared/QTTSR946K?:display_count=n&:origin=viz_share_link)
- Source Data: [USDA FNS SNAP Data Tables](https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap) “Bi-Annual (January and July) State Project Area/County Level Participation and Issuance Data”


### Statewide SNAP Retailers Time Window, 1990-2021
As of late 2021, USDA FNS provides [Historical SNAP Retailer Locator Data](https://www.fns.usda.gov/snap/retailer/historicaldata). However, of the 4099 data points for Hawaii 1614 have location data outside of the state. 
- Data: Store Name, Store Type, Street Address, Latitude/Longitude, Authorization Date, End Date
- [CSV](
https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/Statewide%20SNAP%20Retailers%20Historical-%20FNS.csv)
- [Tableau visualization](https://public.tableau.com/shared/X8WPDN7WP?:display_count=n&:origin=viz_share_link)
- Source Data: [Historical SNAP Retailer Locator Data](https://www.fns.usda.gov/snap/retailer/historicaldata)


### Statewide SNAP Retailers Time Series, 2005-2020
Dr Jerry Shannon previously compiled and maintained a [National database of SNAP authorized retailers, 2008-2020]((https://github.com/jshannon75/snap_retailers)).
Data for Hawaii was extracted, cleaned to address geolocation errors, and restructured.
- Data: Store Name, Address, Store Type, Geolocation, Year
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/Statewide%20SNAP%20Retailer%20Locations%202005-2020.csv)
- [Tableau visualization](https://public.tableau.com/shared/CRTRFNQ8F?:display_count=n&:origin=viz_share_link)
- Source Data: Dr Jerry Shannon's [National database of SNAP authorized retailers, 2008-2020](https://github.com/jshannon75/snap_retailers)


## State Data

### County Daily Application Received and Approved Data, 4/26/20-4/1/22
- Data: Applications received, applications approved, date, county
- [CSV](https://github.com/supersistence/Hawaii-SNAP/blob/main/Data/County%20Weekly%20Applications%204:2020-3:2022.csv)
- [Tableau visualization](https://public.tableau.com/views/Book2_16192056206960/SNAPLocations?:language=en-US&publish=yes&:display_count=n&:origin=viz_share_link)
- Source Data: [Hawaii Department of Human Services](https://humanservices.hawaii.gov/communications/) “SNAP Data by County Received and Approved” ([4/1/22 release](https://humanservices.hawaii.gov/wp-content/uploads/2022/04/SNAP-Data-4.1.22.xlsx))
