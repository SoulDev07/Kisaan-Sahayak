import google.generativeai as genai
import requests
import json
from bs4 import BeautifulSoup as bs
import pandas as pd
from datetime import date, timedelta
from urllib.parse import urlencode
from typing import Dict, Any, Optional
from config.setting import settings


class PriceService:
    """Service for interacting with agricultural price data APIs and Gemini."""

    def __init__(self):
        genai.configure(api_key=settings.GOOGLE_API_KEY)

    async def get_agri_data(self, commodity: str, state: str, district: str, date_from: str, date_to: str):
        params = {
            "Commodity": commodity,
            "State": state,
            "District": district,
            "DateFrom": date_from,
            "DateTo": date_to
        }

        print(f"Received parameters: {params}")

        # 1. Fetch data from the agmarknet API
        data = await self.fetch_agri_data(params)

        print(f"Fetched data: {data}")

        # 2. Summarize the data using Gemini
        # summary = await self.summarize_data(data)
        # print(f"Summary: {summary}")

        return { "data": data }

    def get_url(self, commodity, commodity_head, date_from, date_to, state, district):
        """Given parameters, returns the complete URL to be browsed"""
        base_url = 'https://agmarknet.gov.in/SearchCmmMkt.aspx'

        try:
            # Read commodity data from csv file
            df_commodity = pd.read_csv("assets/CommodityAndCommodityHeads.csv")

            # Find the commodity code
            commodity_row = df_commodity[df_commodity['CommodityHead'] == commodity]
            if commodity_row.empty:
                return None  # Commodity not found
            commodity_code = commodity_row.iloc[0]['Commodity']

            df_state = pd.read_csv("assets/StateToStateCode.csv")
            state_row = df_state[df_state['name'] == state]
            if state_row.empty:
                state_code = "0"
            else:
                state_code = state_row.iloc[0]['code']

        except FileNotFoundError:
            return None # CSV file not found

        parameters = {
            "Tx_Commodity": commodity_code,
            "Tx_State":  state_code,
            "Tx_District": "0",
            "Tx_Market": "0",
            "DateFrom": date_from,
            "DateTo": date_to,
            "Fr_Date": date_from,
            "To_Date": date_to,
            "Tx_Trend": 0,
            "Tx_CommodityHead": commodity,
            "Tx_StateHead": state,
            "Tx_DistrictHead": "--Select--",
            "Tx_MarketHead": "--Select--",
        }

        query = urlencode(parameters)
        return "?".join([base_url, query])

    def get_soup(self, url):
        """Constructs and returns a soup using the HTML content of `url` passed"""
        try:
            response = requests.get(url)
            response.raise_for_status()  # Raise an exception for bad status codes
            return bs(response.content, "html.parser")
        except requests.exceptions.RequestException as e:
            print(f"Error fetching the URL: {e}")
            return None

    def get_all_tables(self, soup):
        """Extracts and returns all tables in a soup object"""
        return soup.find_all("table")

    def get_table_headers(self, table):
        """Given a table soup, returns all the headers"""
        headers = []
        for th in table.find("tr").find_all("th"):
            headers.append(th.text.strip())
        return headers

    def get_table_rows(self, table):
        """Given a table, returns all its rows"""
        rows = []
        for tr in table.find_all("tr")[1:]:
            cells = []
            tds = tr.find_all("td")
            for td in tds:
                cells.append(td.text.strip())
            rows.append(cells)
        return rows

    async def fetch_agri_data(self, params: dict):
        """
        Fetches agricultural data from agmarknet.gov.in based on the provided parameters.
        """
        url = self.get_url(
            params.get("Commodity"),
            params.get("CommodityHead"),
            params.get("DateFrom"),
            params.get("DateTo"),
            params.get("State"),
            params.get("District")
        )

        print(f"Constructed URL: {url}")

        if not url:
            return []

        soup = self.get_soup(url)

        if not soup:
            return []

        tables = self.get_all_tables(soup)

        if not tables:
            return []

        data = []
        for table in tables:
            headers = self.get_table_headers(table)
            rows = self.get_table_rows(table)
            for row in rows:
                data.append(dict(zip(headers, row)))

        return data

    async def summarize_data(self, data: list):
        model = genai.GenerativeModel('gemini-2.5-flash')

        prompt = f"""
        Please summarize the following agricultural data.
        Provide a concise summary of the key trends and information.

        Data:
        {json.dumps(data, indent=2)}
        """

        response = await model.generate_content_async(prompt)

        return response.text

# Create singleton instance
price_service = PriceService()
