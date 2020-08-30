import psycopg2
from bs4 import BeautifulSoup
import requests
from requests import get
import sqlite3
import geopandas
import geopy
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

#cafeNames
def scrapecafes(city, area):

    #url = 'https://www.broadsheet.com.au/melbourne/guides/best-cafes-thornbury' #go to the website
    url = f"https://www.broadsheet.com.au/{city}/guides/best-cafes-{area}"
    response = requests.get(url, timeout=5)

    soup_cafe_names = BeautifulSoup(response.content, "html.parser")
    type(soup_cafe_names)

    cafeNames = soup_cafe_names.findAll('h2', attrs={"class":"venue-title", }) #scrape the elements
    cafeNamesClean = [cafe.text.strip() for cafe in cafeNames] #clean the elements
    #cafeNameTuple = [(cafe,) for cafe in cafeNamesCleans

    #print(cafeNamesClean)

    #addresses
    soup_cafe_addresses = BeautifulSoup(response.content, "html.parser")
    type(soup_cafe_addresses)

    cafeAddresses = soup_cafe_addresses.findAll( attrs={"class":"address-content" })
    cafeAddressesClean = [address.text for address in cafeAddresses]
    #cafeAddressesTuple = [(address,) for address in cafeAddressesClean]

    #print(cafeAddressesClean)

    ##geocode addresses
    locator = Nominatim(user_agent="myGeocoder")
    geocode = RateLimiter(locator.geocode, min_delay_seconds=1)
    lat = []
    long = []

    try:
        for address in cafeAddressesClean:
            location = locator.geocode(address.strip().replace(',',''))
            long.append(location.longitude)
            lat.append(location.latitude)
    except:
            long.append(None)
            lat.append(None)

    #zip up for table
    fortable = list(zip(cafeNamesClean, cafeAddressesClean, long,lat))
    print(fortable)

##connect to database
    try:
        sqliteConnection = sqlite3.connect('21august_database.db')
        cursor = sqliteConnection.cursor()
        print("Database created and Successfully Connected to 21august_database")

        sqlite_select_Query = "select sqlite_version();"
        cursor.execute(sqlite_select_Query)
        record = cursor.fetchall()
        print("SQLite Database Version is: ", record)
        cursor.close()

    except sqlite3.Error as error:
        print("Error while connecting to sqlite", error)

    #create table
    try:
        sqlite_create_table_query = ''' CREATE TABLE IF NOT EXISTS test9 (
                                        name TEXT NOT NULL,
                                        address TEXT NOT NULL,
                                        longitude FLOAT,
                                        latitude FLOAT
                                        );'''

        cursor = sqliteConnection.cursor()
        print("Successfully Connected to SQLite")
        cursor.execute(sqlite_create_table_query)
        sqliteConnection.commit()
        print("SQLite table created")

    except sqlite3.Error as error:
        print("Error while creating a sqlite table", error)

##enter data into table
    try:
        sqlite_insert_name_param = """INSERT INTO test9
                            (name, address, longitude, longitude)
                            VALUES (?,?,?,?);"""

        cursor.executemany(sqlite_insert_name_param, fortable)

        sqliteConnection.commit()
        print("Total", cursor.rowcount, "Records inserted successfully into table")
        sqliteConnection.commit()

        cursor.close()

    except sqlite3.Error as error:
        print("Failed to insert data into sqlite table", error)

    finally:
        if (sqliteConnection):
            sqliteConnection.close()
            print("The SQLite connection is closed")

scrapecafes('melbourne', 'abbotsford')
