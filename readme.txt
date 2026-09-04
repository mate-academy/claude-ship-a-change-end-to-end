Finland Weather CLI
====================

A terminal application that prints current weather statistics for major
cities in Finland: Helsinki, Espoo, Tampere, Vantaa, Oulu, Turku,
Jyvaskyla, and Lahti.

Weather data comes from Open-Meteo (https://open-meteo.com), a free
service that requires no API key or signup. The script uses only the
Python standard library, so there is nothing to install.

Requirements
------------
- Python 3.x
- An internet connection (to fetch live weather data)
- No pip installation needed - the script uses only the Python standard
  library, so there are no third-party packages to install

Usage
-----
Run from inside the weather_app folder:

    python weather.py

This prints a table with current temperature, feels-like temperature,
humidity, wind speed/direction, and conditions for all cities.

To see detailed stats for a single city, pass its name as an argument
(case-insensitive):

    python weather.py tampere
    python weather.py Helsinki

If the city name is not recognized, the script prints the list of valid
city names and exits with a non-zero status.

To see a 7-day forecast instead of current conditions, add the -f (or
--forecast) flag. It works both with a single city and with all cities:

    python weather.py Helsinki --forecast
    python weather.py -f

Each forecast shows, per day: condition, high/low temperature, total
precipitation, and max wind speed.

By default, temperatures are shown in Celsius. Use -u (or --units) to
show Fahrenheit instead. This works with any of the modes above:

    python weather.py -u fahrenheit
    python weather.py Helsinki -u fahrenheit
    python weather.py Helsinki -f -u fahrenheit

Notes
-----
- If a city's data cannot be fetched (e.g. no internet connection), the
  script prints an error for that city instead of crashing.
- Non-ASCII city names (like Jyvaskyla) are displayed correctly even on
  Windows terminals that don't default to UTF-8.
