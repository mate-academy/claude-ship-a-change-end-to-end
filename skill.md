# Manual Verification Steps: weather.py

Run these checks after any change to `weather.py` to confirm the CLI still
works end to end. All commands are run from inside `weather_app/` with an
active internet connection (the app calls the live Open-Meteo API).

## 1. Default table (all cities, current conditions)

```
python weather.py
```

Expect: a table with one row per city (Helsinki, Espoo, Tampere, Vantaa,
Oulu, Turku, Jyväskylä, Lahti) showing temp, feels-like, humidity, wind
speed/direction, and condition. "Jyväskylä" must render correctly, not as
mojibake (e.g. `Jyv?skyl?`).

## 2. Single city, current conditions

```
python weather.py Tampere
python weather.py tampere
```

Expect: both commands (case-insensitive) print the same detailed block
(condition, temperature, feels like, humidity, wind, precipitation,
observed-at timestamp) for Tampere.

## 3. Unknown city

```
python weather.py NotACity
echo $?
```

Expect: an error message listing the 8 valid city names, printed to
stderr, and a non-zero exit code (1).

## 4. 7-day forecast

```
python weather.py -f
python weather.py Helsinki --forecast
```

Expect: `-f` alone prints a 7-day forecast block for every city in turn
(date, condition, high/low, precipitation, max wind). `Helsinki --forecast`
prints just Helsinki's block. Columns should stay aligned even when the
condition text is long (e.g. "Slight rain showers").

## 5. Units flag

```
python weather.py -u fahrenheit
python weather.py Helsinki -u fahrenheit
python weather.py Helsinki -f -u fahrenheit
python weather.py -u kelvin
```

Expect: the first three print Fahrenheit values (suffixed `F`) in the
table, single-city, and forecast modes respectively, with sensible values
(e.g. ~50-60F for a Finnish autumn day, not obviously wrong). The last
command should reject `kelvin` with an argparse usage/error message and
exit code 2, since only `celsius` and `fahrenheit` are valid choices.

## 6. Network failure handling

Simulate an unreachable API by temporarily pointing the script at a bad
host, e.g.:

```
python -c "
import weather
weather.API_URL = 'https://nonexistent.invalid.example/v1/forecast'
weather.print_table(weather.CITIES)
"
```

Expect: one error line per city (not a raw traceback), and the script
does not crash.

## 7. Readme accuracy

Re-read `readme.txt` after any CLI flag change and confirm every documented
command still matches the actual `argparse` options in `weather.py`
(currently: optional `city` positional, `-f`/`--forecast`,
`-u`/`--units {celsius,fahrenheit}`).
