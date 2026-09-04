#!/usr/bin/env python3
"""Print current weather statistics for major cities in Finland.

Data source: Open-Meteo (https://open-meteo.com) - free, no API key required.
Uses only the Python standard library.
"""

import argparse
import io
import json
import sys
import urllib.error
import urllib.request

# Force UTF-8 output so non-ASCII city names (e.g. "Jyväskylä") render
# correctly regardless of the terminal's default codepage (an issue on
# Windows, where the console often defaults to cp1252/cp850).
for _stream_name in ("stdout", "stderr"):
    _stream = getattr(sys, _stream_name)
    if isinstance(_stream, io.TextIOWrapper) and _stream.encoding.lower() != "utf-8":
        setattr(sys, _stream_name, io.TextIOWrapper(
            _stream.buffer, encoding="utf-8", errors="replace", newline=""
        ))

API_URL = "https://api.open-meteo.com/v1/forecast"
CURRENT_FIELDS = (
    "temperature_2m,relative_humidity_2m,apparent_temperature,"
    "precipitation,weather_code,wind_speed_10m,wind_direction_10m"
)
DAILY_FIELDS = (
    "weather_code,temperature_2m_max,temperature_2m_min,"
    "precipitation_sum,wind_speed_10m_max"
)
FORECAST_DAYS = 7
REQUEST_TIMEOUT_SECONDS = 10
UNIT_SYMBOLS = {"celsius": "C", "fahrenheit": "F"}

CITIES = {
    "Helsinki": (60.1699, 24.9384),
    "Espoo": (60.2055, 24.6559),
    "Tampere": (61.4978, 23.7610),
    "Vantaa": (60.2934, 25.0378),
    "Oulu": (65.0121, 25.4651),
    "Turku": (60.4518, 22.2666),
    "Jyväskylä": (62.2426, 25.7473),
    "Lahti": (60.9827, 25.6612),
}

# WMO weather interpretation codes (subset covering common conditions).
WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


def condition_from_code(code):
    return WEATHER_CODES.get(code, f"Unknown ({code})")


def compass_direction(degrees):
    directions = (
        "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
        "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
    )
    index = round(degrees / 22.5) % 16
    return directions[index]


def fetch_current_weather(latitude, longitude, temperature_unit="celsius"):
    query = (
        f"{API_URL}?latitude={latitude}&longitude={longitude}"
        f"&current={CURRENT_FIELDS}&temperature_unit={temperature_unit}"
        f"&timezone=Europe/Helsinki"
    )
    with urllib.request.urlopen(query, timeout=REQUEST_TIMEOUT_SECONDS) as response:
        payload = json.load(response)
    return payload["current"]


def fetch_city_weather(city, temperature_unit="celsius"):
    latitude, longitude = CITIES[city]
    return fetch_current_weather(latitude, longitude, temperature_unit)


def fetch_daily_forecast(latitude, longitude, temperature_unit="celsius"):
    query = (
        f"{API_URL}?latitude={latitude}&longitude={longitude}"
        f"&daily={DAILY_FIELDS}&forecast_days={FORECAST_DAYS}"
        f"&temperature_unit={temperature_unit}&timezone=Europe/Helsinki"
    )
    with urllib.request.urlopen(query, timeout=REQUEST_TIMEOUT_SECONDS) as response:
        payload = json.load(response)
    return payload["daily"]


def fetch_city_forecast(city, temperature_unit="celsius"):
    latitude, longitude = CITIES[city]
    return fetch_daily_forecast(latitude, longitude, temperature_unit)


def print_table(cities, temperature_unit="celsius"):
    unit = UNIT_SYMBOLS[temperature_unit]
    header = f"{'City':<12}{'Temp':>7}{'Feels':>8}{'Humidity':>10}{'Wind':>14}  Condition"
    print(header)
    print("-" * len(header))
    for city in cities:
        try:
            current = fetch_city_weather(city, temperature_unit)
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
            print(f"{city:<12}  Error fetching weather data: {exc}")
            continue

        temp = f"{current['temperature_2m']:.1f}{unit}"
        feels = f"{current['apparent_temperature']:.1f}{unit}"
        humidity = f"{current['relative_humidity_2m']}%"
        wind = f"{current['wind_speed_10m']:.0f} km/h {compass_direction(current['wind_direction_10m'])}"
        condition = condition_from_code(current["weather_code"])

        print(f"{city:<12}{temp:>7}{feels:>8}{humidity:>10}{wind:>14}  {condition}")


def print_single_city(city, temperature_unit="celsius"):
    unit = UNIT_SYMBOLS[temperature_unit]
    try:
        current = fetch_city_weather(city, temperature_unit)
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
        print(f"Error fetching weather data for {city}: {exc}", file=sys.stderr)
        sys.exit(1)

    print(f"Current weather in {city}")
    print("-" * (len(city) + 20))
    print(f"Condition:    {condition_from_code(current['weather_code'])}")
    print(f"Temperature:  {current['temperature_2m']:.1f} {unit}")
    print(f"Feels like:   {current['apparent_temperature']:.1f} {unit}")
    print(f"Humidity:     {current['relative_humidity_2m']}%")
    print(
        f"Wind:         {current['wind_speed_10m']:.0f} km/h "
        f"{compass_direction(current['wind_direction_10m'])}"
    )
    print(f"Precipitation: {current['precipitation']} mm")
    print(f"Observed at:  {current['time']}")


def print_forecast_for_city(city, temperature_unit="celsius"):
    unit = UNIT_SYMBOLS[temperature_unit]
    try:
        daily = fetch_city_forecast(city, temperature_unit)
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as exc:
        print(f"Error fetching forecast for {city}: {exc}", file=sys.stderr)
        return

    title = f"{FORECAST_DAYS}-day forecast for {city}"
    print(title)
    print("-" * len(title))
    header = f"{'Date':<12}{'Condition':<22}{'High':>6}{'Low':>6}{'Precip':>9}{'Wind max':>11}"
    print(header)
    print("-" * len(header))

    days = zip(
        daily["time"],
        daily["weather_code"],
        daily["temperature_2m_max"],
        daily["temperature_2m_min"],
        daily["precipitation_sum"],
        daily["wind_speed_10m_max"],
    )
    for date, code, high, low, precip, wind_max in days:
        condition = condition_from_code(code)
        high_str = f"{high:.1f}{unit}"
        low_str = f"{low:.1f}{unit}"
        precip_str = f"{precip:.1f}mm"
        wind_str = f"{wind_max:.0f}km/h"
        print(f"{date:<12}{condition:<22}{high_str:>6}{low_str:>6}{precip_str:>9}{wind_str:>11}")


def resolve_city(name):
    for city in CITIES:
        if city.lower() == name.lower():
            return city
    return None


def main():
    parser = argparse.ArgumentParser(
        description="Print current weather statistics for major cities in Finland."
    )
    parser.add_argument(
        "city",
        nargs="?",
        help="Print stats for a single city (case-insensitive). "
        "Omit to print all cities.",
    )
    parser.add_argument(
        "-f",
        "--forecast",
        action="store_true",
        help=f"Show a {FORECAST_DAYS}-day forecast instead of current conditions.",
    )
    parser.add_argument(
        "-u",
        "--units",
        choices=sorted(UNIT_SYMBOLS),
        default="celsius",
        help="Temperature unit to display (default: celsius).",
    )
    args = parser.parse_args()

    if args.city is None:
        if args.forecast:
            for index, city in enumerate(CITIES):
                if index > 0:
                    print()
                print_forecast_for_city(city, args.units)
        else:
            print_table(CITIES, args.units)
        return

    city = resolve_city(args.city)
    if city is None:
        valid = ", ".join(sorted(CITIES))
        print(f"Unknown city '{args.city}'. Valid choices: {valid}", file=sys.stderr)
        sys.exit(1)

    if args.forecast:
        print_forecast_for_city(city, args.units)
    else:
        print_single_city(city, args.units)


if __name__ == "__main__":
    main()
