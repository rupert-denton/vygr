import sys
print(sys.executable)
import psycopg2
from config import config
import geopandas
import geopy
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

def details(name, address):
    locator = Nominatim(user_agent="myGeocoder")
    location = locator.geocode(address)
    print(f'Address located by Nominatim: {address}')
    print('Geocoding address.')
    print('Geocoding complete:', location.longitude, location.latitude)

    long = location.longitude
    lat = location.latitude

    table = (name, address, long, lat)

    print(f'The following data has been entered into database table: {table}' )

        #add scraped data into PostgreSQL Database Table (Anybody1, a_cafes)

    sql = "INSERT INTO a_cafes(cafe_name, cafe_address, cafe_long, cafe_lat) VALUES(%s, %s, %s, %s)" #this variable preps table for data entry
    conn = None

    try:
        ##read database configuration, I believe anybody1.ini
        params = config(filename= '/Users/rupertdenton/Desktop/Coding/anybody/anybody1.ini', section='postgresql')

        #connect to the PostgreSQL database (Anybody1.db)
        print('Connecting to the PostgreSQL DB')
        conn = psycopg2.connect(**params)

        #create and connect to a new cursor (cursor = analogy from slide ruler, needed to "transverse" database data)
        cur = conn.cursor()

        #execute the INSERT statement ("sql" variable above)
        cur.execute(sql, table)
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

details('Johnnys Bodega', '159 Ormond Rd, Elwood VIC 3184')
