import psycopg2
from config import config
from bs4 import BeautifulSoup
import requests
from requests import get
import geopandas
import geopy
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

#get cafe names,  addresses and geocoords for user parameters
def scrapecafes(city, area):

    url = f"https://www.broadsheet.com.au/{city}/guides/best-cafes-{area}"
    response = requests.get(url, timeout=5)

    soup_cafe_names = BeautifulSoup(response.content, "html.parser")
    type(soup_cafe_names)

    cafeNames = soup_cafe_names.findAll('h2', attrs={"class":"venue-title", }) #scrape the names
    cafeNamesClean = [cafe.text.strip() for cafe in cafeNames] #clean the names

    #addresses
    soup_cafe_addresses = BeautifulSoup(response.content, "html.parser")
    type(soup_cafe_addresses)

    cafeAddresses = soup_cafe_addresses.findAll( attrs={"class":"address-content" }) #scrape the addresses
    cafeAddressesClean = [address.text for address in cafeAddresses] #clean the addresses

    ##geocode addresses
    locator = Nominatim(user_agent="myGeocoder")
    geocode = RateLimiter(locator.geocode, min_delay_seconds=1)
    lat = []
    long = []

    def get_location(address):
        words = address.split()  # does this just split the entirety of the address into a set?
        while words: #can you explain this a bit?
            try:
                return locator.geocode(' '.join(words))
            except:  # address is junk and raised an exception
                words = words[1:]  # So does this cycle through the address index by index until it works?

    try:
        for address in cafeAddressesClean:
            location = get_location (address)

            if location is not None:
                long.append(location.longitude)
                lat.append(location.latitude)
    except:
            print('Failure')

    #zip up to be added to database table
    fortable = list(zip(cafeNamesClean, cafeAddressesClean, long, lat))
    print(fortable)

    #add scraped data into PostgreSQL Database Table (Anybody1, a_cafes)

    sql = "INSERT INTO a_cafes(cafe_name, cafe_address, cafe_long, cafe_lat) VALUES(%s, %s, %s, %s)" #this variable preps table for data entry
    conn = None

    try:
        ##read database configuration, I believe anybody1.ini
        params = config()

        #connect to the PostgreSQL database (Anybody1.db)
        print('Connecting to the PostgreSQL DB')
        conn = psycopg2.connect(**params)

        #create and connect to a new cursor (cursor = analogy from slide ruler, needed to "transverse" database data)
        cur = conn.cursor()

        #execute the INSERT statement ("sql" variable above)
        cur.executemany(sql, fortable)
        print("Inserting your data")

        #commit the changes to the Anbody1 db

        conn.commit()
        print("Total", cur.rowcount, "Records inserted successfully into table")

        #close off database communication
        cur.close()

    except (Exception, psycopg2.DatabaseError) as error:
      print(error)

    finally:
      if conn is not None:
          conn.close()
          print('Database connection closed.')

scrapecafes('melbourne', 'north-melbourne')
