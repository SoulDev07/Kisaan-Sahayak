# services/soil_moisture.py
import requests
import os
import pandas as pd # Import pandas for data manipulation

SOIL_API_URL = "https://api.data.gov.in/resource/4554a3c8-74e3-4f93-8727-8fd92161e345"
# Directly use your API key for testing
DATA_GOV_API_KEY = "579b464db66ec23bdd000001f98db72a1fea4df0757c14b5d10dd835" # Your actual key

def get_soil_moisture_data(state: str, district: str = None, year: str = None, month: str = None):
    """
    Fetches daily soil moisture data for a given location and time period,
    dynamically applying filters. It then processes the data to return only
    the latest entry for each unique State-District combination found in the results.
    """
    params = {
        "api-key": DATA_GOV_API_KEY,
        "format": "json",
        "offset": "0",
        "limit": "1000",  # Increased limit to fetch more data, in case latest is beyond first 100
        "filters[State]": state.strip(), # State is mandatory
    }

    # Conditionally add other filters if they are provided (not None or empty string)
    if district and district.strip():
        params["filters[District]"] = district.strip()
    if year and year.strip():
        params["filters[Year]"] = year.strip()
    if month and month.strip():
        params["filters[Month]"] = month.strip().capitalize()

    try:
        # print(f"Requesting URL: {SOIL_API_URL} with params: {params}") # Uncomment for debugging API request
        response = requests.get(SOIL_API_URL, params=params)
        response.raise_for_status() # Raises an HTTPError for bad responses (4xx or 5xx)
        data = response.json()
        # print(f"API Raw Response Data: {data}") # Uncomment to see the raw, unprocessed API response

        records = data.get("records", [])

        if not records:
            print("No records found for the given filters.")
            return []

        # Convert the list of dictionaries to a pandas DataFrame for easier manipulation
        df = pd.DataFrame(records)

        # Ensure 'Date' column is in datetime format for proper sorting
        # Use errors='coerce' to turn unparseable dates into NaT (Not a Time)
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')

        # Drop any rows where the Date conversion failed
        df.dropna(subset=['Date'], inplace=True)

        if df.empty:
            print("No valid date records after parsing.")
            return []

        # Sort the DataFrame by 'Date' in descending order so the latest date comes first
        df_sorted = df.sort_values(by='Date', ascending=False)

        # Group by 'State' and 'District' and get the first record from each group.
        # Since we sorted by date descending, the 'first()' record will be the latest one.
        # .reset_index() converts the grouped result back into a flat DataFrame.
        latest_records_df = df_sorted.groupby(['State', 'District']).first().reset_index()

        # Convert the processed DataFrame back to a list of dictionaries.
        # .to_dict(orient='records') ensures all columns are included for each record.
        processed_data = latest_records_df.to_dict(orient='records')

        print(f"Returning Processed Latest Records (per State-District): {processed_data}")
        return processed_data

    except requests.exceptions.RequestException as e:
        print(f"Error fetching soil moisture data: {e}")
        # Return a dictionary with an error message for the HTTPException in FastAPI
        return {"error": f"Failed to fetch soil moisture data: {e}"}
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return {"error": "An unexpected error occurred"}