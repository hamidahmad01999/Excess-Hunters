import sys
from datetime import datetime
from urllib.parse import quote_plus
from dotenv import load_dotenv
import pymysql
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
import re
import json
import time
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from urllib.parse import urlparse, parse_qs
import pandas as pd
import zipfile
import os
import zipfile
import undetected_chromedriver as uc
from seleniumwire.undetected_chromedriver import Chrome, ChromeOptions  # <- Selenium-Wire + UC

BASE_URL = "https://broward.realforeclose.com/"
    
def load_env():
    load_dotenv()
    return {
        "host": os.getenv("DB_HOST"),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
        "database": os.getenv("DB_NAME"),
        "platform_username":os.getenv("PLATFORM_USERNAME"),
        "platform_password":os.getenv("PLATFORM_PASSWORD"),
        "proxy_host":os.getenv("PROXY_HOST"),
        "proxy_port":os.getenv("PROXY_PORT"),
        "proxy_user":os.getenv("PROXY_USER"),
        "proxy_pass":os.getenv("PROXY_PASS"),
    }

def connect_db(config):
    return pymysql.connect(
        host=config["host"],
        user=config["user"],
        password=config["password"],
        database=config["database"],
        charset='utf8mb4'
    )


def save_auctions_to_db(data_list, connection, table_name="auctions"):
    """
    Save scraped auction data to MySQL database.

    Parameters:
        data_list (list): List of dictionaries containing auction data.
        connection (pymysql.connections.Connection): Existing DB connection.
        table_name (str): Table to save data into.
    """
    
    
    if not connection.open:  # <- check if connection is alive
        connection.ping(reconnect=True)
    
    # Define table columns
    columns = [
        "PropertyAddress", "AuctionType", "CaseNo", "FinalJudgementAmount",
        "ParcelID", "AuctionDate", "AuctionSoldAmount", "SoldTo",
        "PlaintiffMaxBid", "AuctionStatus", "Link"
    ]
    

    # Create table if not exists
    create_table_sql = f"""
    CREATE TABLE IF NOT EXISTS `{table_name}` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        PropertyAddress VARCHAR(255),
        AuctionType VARCHAR(255),
        CaseNo VARCHAR(255),
        FinalJudgementAmount VARCHAR(255),
        ParcelID VARCHAR(255),
        AuctionDate VARCHAR(100),
        AuctionSoldAmount VARCHAR(100),
        SoldTo VARCHAR(255),
        PlaintiffMaxBid VARCHAR(255),
        AuctionStatus VARCHAR(100),
        Link TEXT
    )
    """
    
    try:
        with connection.cursor() as cursor:
            cursor.execute(create_table_sql)
        connection.commit()
    except Exception as e:
        print("Error creating table:", e)
    

    # Insert data
    insert_sql = f"""
    INSERT INTO `{table_name}` (
        PropertyAddress, AuctionType, CaseNo, FinalJudgementAmount,
        ParcelID, AuctionDate, AuctionSoldAmount, SoldTo,
        PlaintiffMaxBid, AuctionStatus, Link
    ) VALUES (
        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
    )
    """
    

    inserted_count = 0
    for data in data_list:
        auction_status_info = data.get("auction_status", {})
        details = data.get("details", {})
        

        def get_detail(key):
            return details.get(key, "") or ""

        
        # Auction status & date logic
        status = auction_status_info.get("status") or auction_status_info.get("Auction Starts") or ""
        date = auction_status_info.get("date") or auction_status_info.get("Auction Starts") or ""
        
        if not is_date(date):
            date = ""
        if status.lower() == "auction starts":
            auction_date = date
            auction_status = "Auction Starts"
        else:
            auction_date = date or ""
            auction_status = status or ""
        

        amount = auction_status_info.get("amount", "")
        if auction_status.lower() != "auction sold":
            amount = ""

        
        # Clean final judgment amount
        final_judgment_amount = get_detail("Final Judgment Amount").replace("$", "").replace(",", "").strip()
        

        values = (
            get_detail("Property Address"),
            get_detail("Case Type"),
            get_detail("Case Number"),
            final_judgment_amount,
            get_detail("Parcel ID"),
            auction_date,
            amount,
            "",  # Sold To
            "",  # Plaintiff Max Bid
            auction_status,
            auction_status_info.get("link")
        )
        

        try:
            with connection.cursor() as cursor:
                cursor.execute(insert_sql, values)
            inserted_count += 1
        except Exception as e:
            print(f"Error inserting row {values}: {e}")
            continue

        
    connection.commit()
    print(f"Inserted {inserted_count} / {len(data_list)} records into `{table_name}`")

def setup_driver(config):
    # ——— your proxy creds ———
    proxy_host = config["proxy_host"]
    proxy_port = config["proxy_port"]
    proxy_user = config["proxy_user"]
    proxy_pass = config["proxy_pass"]
    # ———————————————————————

    seleniumwire_options = {
        'proxy': {
            'http':  f'http://{proxy_user}:{proxy_pass}@{proxy_host}:{proxy_port}',
            'https': f'http://{proxy_user}:{proxy_pass}@{proxy_host}:{proxy_port}',
            'no_proxy': 'localhost,127.0.0.1'
        }
    }

    options = ChromeOptions()
    options.headless = False
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument(f"--user-data-dir={os.path.join(os.getcwd(), 'chrome-profile')}")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument('--ignore-certificate-errors')
    options.add_argument('--allow-insecure-localhost')
    options.add_argument('--ignore-ssl-errors=yes')


    driver = Chrome(options=options, seleniumwire_options=seleniumwire_options)
    return driver
    

def get_from_and_to(connection):
    try:
        with connection.cursor(pymysql.cursors.DictCursor) as cursor:   # ✅ DictCursor
            cursor.execute("SELECT * FROM scraper_logs LIMIT 1")
            row = cursor.fetchone()
            
            if not row:
                return None
            
            now = datetime.now()

            if row.get("next_run_time") and now >= row["next_run_time"]:
                return {
                    "run_type": "next_run",
                    "from": row.get("next_run_from") or None,
                    "to": row.get("next_run_to") or None
                }
            else:
                return {
                    "run_type": "daily_run",
                    "from": row.get("daily_run_from") or None,
                    "to": row.get("daily_run_to") or None
                }
    except Exception as e:
        print("Error in getting dates", e)
        return "", None, None
    finally:
        connection.close()

def is_date(string, date_format="%m/%d/%Y %I:%M %p"):
    # Remove timezone abbreviation (e.g., ' ET') if present
    string = string.rsplit(' ', 1)[0] if string.endswith(" ET") else string
    try:
        datetime.strptime(string, date_format)
        return True
    except ValueError:
        return False

def get_aid_from_url(url):
    try:
        query_params = parse_qs(urlparse(url).query)
        return query_params.get("AID", [None])[0]
    except Exception as e:
        print("Error occured in getting AID from url ", e)

def is_valid_date(date_str, date_format="%m/%d/%Y %I:%M %p %Z"):
    try:
        datetime.strptime(date_str, date_format)
        return True
    except Exception:
        return False
    
def format_to_mmddyyyy(date_str):
 
    if not date_str:
        return ""
    try:
        # Try MM/DD/YYYY first
        datetime.strptime(date_str, "%m/%d/%Y")
        return date_str
    except:
        try:
            # Try YYYY-MM-DD
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            return dt.strftime("%m/%d/%Y")
        except:
            return ""  # Invalid format


def login(config, driver, base_url=BASE_URL, timeout=20):
    try:
        driver.get(base_url)
        time.sleep(10)  # Extra wait for JS
        # driver.save_screenshot("login_page_headless.png")  # Check what page looks like
        # print(driver.current_url)  # Ensure no redirect
        # print(driver.page_source[:1000])  # Inspect
        wait = WebDriverWait(driver, timeout)
        
        # Wait until page is fully loaded
        wait.until(lambda d: d.execute_script('return document.readyState') == 'complete')

        try:
            # Wait for the nav div to appear if present (timeout small)
            nav_div = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.ID, "MAIN_TBL_NAV"))
            )
            if "Welcome" in nav_div.text:
                print("[Info] Already logged in. Skipping login.")
                return True  # Skip login because already logged in
        except Exception as e:
            print("Welcome error (probably not logged in):", e)
            # Continue to login steps if nav div not found
        
        # Wait and enter username
        username_input = wait.until(EC.presence_of_element_located((By.ID, "LogName")))
        username_input.clear()
        username_input.send_keys(config["platform_username"])

        # Wait and enter password
        password_input = wait.until(EC.presence_of_element_located((By.ID, "LogPass")))
        password_input.clear()
        password_input.send_keys(config["platform_password"])

        # Wait and click login button
        login_btn = wait.until(EC.element_to_be_clickable((By.ID, "LogButton")))
        login_btn.click()

        print("[Info] Login successful")

        # Wait until after login page loads (for example, wait for MAIN_TBL_NAV to appear)
        wait.until(EC.presence_of_element_located((By.ID, "MAIN_TBL_NAV")))

        return True
    except Exception as e:
        print(f"Error occurred in login: {e}")
        return False

def handle_notice_buttons(driver):
    wait = WebDriverWait(driver, 15)
    wait.until(lambda d: d.execute_script('return document.readyState') == 'complete')  # short timeout for check

    try:
        # Check if the div is visible
        notice_div = wait.until(
            EC.presence_of_element_located((By.ID, "NOTICEBUTTONS"))
        )
        if notice_div.is_displayed():
            bnotacc_btn = driver.find_element(By.ID, "BNOTACC")
            bnotacc_btn.click()
            return True  # found and clicked
        else:
            return False

    except Exception as e:
        # Element not found
        print("Notfication btns error: ", e)
        return False


def wait_until_notice_gone(driver):
    print("Handling notifications btn!")
    while True:
        found = handle_notice_buttons(driver)
        if not found:
            print("[INFO] NOTICEBUTTONS not present. Exiting loop.")
            return
        time.sleep(1)  # small pause before checking again

def set_date_with_js(driver, element_id, date_value):
    if not date_value:
        return
    js_code = f'''
    let elem = document.getElementById("{element_id}");
    if(elem) {{
        elem.value = "{date_value}";
        elem.dispatchEvent(new Event('input', {{ bubbles: true }}));
        elem.dispatchEvent(new Event('change', {{ bubbles: true }}));
    }}
    '''
    driver.execute_script(js_code)

def quick_search_handler(driver, start_date=None, end_date=None):
    try:
        wait = WebDriverWait(driver, 15)
        wait.until(lambda d: d.execute_script('return document.readyState') == 'complete')  # 15 seconds timeout

        # driver.get(quick_search_url)

        # Step 1: Get the sidebar by id
        sidebar = wait.until(EC.presence_of_element_located((By.ID, "ln_menu")))

        # Step 2: Find Quick Search link inside sidebar
        quick_search_link = sidebar.find_element(By.XPATH, ".//span[normalize-space()='Quick Search']/parent::a")

        # Step 3: Click it
        quick_search_link.click()

        # Wait until the select element is present and visible
        wait.until(EC.visibility_of_element_located((By.ID, "AUCT_TYPE")))

        # Now create Select object and choose option with value "1" (Foreclosure)
        select_element = driver.find_element(By.ID, "AUCT_TYPE")
        select = Select(select_element)
        select_element.click()

        # Click the option with value "1"
        option = driver.find_element(By.CSS_SELECTOR, '#AUCT_TYPE option[value="1"]')
        option.click()
        # select.select_by_value("1")  # Select Foreclosure (value=1)

        # Wait 2 seconds after selection (optional)
        driver.implicitly_wait(2)
        
         # Format dates to MM/DD/YYYY
        try:
            start_date = format_to_mmddyyyy(start_date)
            end_date = format_to_mmddyyyy(end_date)
            print(f"Start date {start_date} end date {end_date}")
            # Set start date if provided
            if start_date:
                set_date_with_js(driver, "view_ssdate", start_date)


            # Set end date if provided
            if end_date:
                set_date_with_js(driver, "view_sedate", end_date)

        except Exception as e:
            print("Error in date handling in quick search ", e)

        driver.implicitly_wait(2)
        # Click the button with id "testBut"
        wait.until(EC.element_to_be_clickable((By.ID, "testBut"))).click()
        time.sleep(10)
        return True
    except Exception as e:
        print("Error occur in quick search handler ", e)
        return False

def scrape_links_from_table(driver):
    wait = WebDriverWait(driver, 15)
    wait.until(lambda d: d.execute_script('return document.readyState') == 'complete')

    # Wait until the table is present
    links = []
    while True:
        time.sleep(5)
        try:
            table = wait.until(EC.presence_of_element_located((By.ID, "main_report")))

            # Get all rows with role="row"
            rows = table.find_elements(By.CSS_SELECTOR, 'tr[role="row"]')
        except Exception as e:
            print("Table with auctions data not found ",e)
            return links

        for row in rows:
            try:
                # Get the 3rd td and then its <a> tag
                td = row.find_elements(By.TAG_NAME, "td")[2]  # index 2 = 3rd td
                a_tag = td.find_element(By.TAG_NAME, "a")
                href = a_tag.get_attribute("href")
                links.append(href)
            except Exception as e:
                # Skip rows without the expected structure
                continue
        # Go to next page if available
        try:
            next_td = driver.find_element(By.ID, "next_pager")
            classes = next_td.get_attribute("class") or ""
            # Check if disabled it means no next page
            if "ui-state-disabled" in classes:
                print("[INFO] Next button disabled. Stopping pagination.")
                break
            
            # Click next
            driver.execute_script("arguments[0].click();", next_td)
            print("[INFO] Clicked next page.")
            time.sleep(3)  # wait for new data to load
        except Exception as e:
            print("Error occur in next page btn ", e)
            break
        
    return links


def extract_auction_and_case(driver, url, timeout=15):
    try:
        aid = get_aid_from_url(url)
    except Exception as e:
        print("Fail to get aid: ", e)
        return {}

    driver.get(url)
    time.sleep(3)
    result = {"auction_status": {}, "details": {}}
    wait = WebDriverWait(driver, timeout)
    wait.until(lambda d: d.execute_script('return document.readyState') == 'complete')
    aid_str = str(aid)

    # Wait for container
    try:
        container = wait.until(EC.presence_of_element_located((By.ID, f"AIC_MAIN_{aid_str}")))
    except TimeoutException:
        raise TimeoutException(f"AIC_MAIN_{aid_str} not found on page (timeout={timeout}s)")

    # ---- Auction status parsing ----
    try:
        auction_item = container.find_element(By.CSS_SELECTOR, f"#AITEM_{aid_str}")
        stats_divs = auction_item.find_elements(By.CSS_SELECTOR, ".AUCTION_STATS > div")

        auction_status = ""
        date = ""
        amount = ""

        i = 0
        while i < len(stats_divs):
            label = stats_divs[i].text.strip()
            value = stats_divs[i + 1].text.strip() if i + 1 < len(stats_divs) else ""

            # First label will be status
            if not auction_status and label:
                auction_status = label
                date = value  # may be empty for postponed/canceled
                if not is_date(date):
                    auction_status = date
                    date = ""
            elif label.lower() == "amount":
                amount = value

            i += 2

        result["auction_status"] = {
            "status": auction_status,
            "date": date,
            "amount": amount,
            "link":url
        }

    except NoSuchElementException:
        result["auction_status"] = {"status": "", "date": "", "amount": ""}

    # ---- Case details ----
    table = None
    try:
        table = container.find_element(By.CSS_SELECTOR, "table.bdTab")
    except NoSuchElementException:
        try:
            table = driver.find_element(By.CSS_SELECTOR, "div.bdetails table.bdTab")
        except NoSuchElementException:
            table = None

    if table:
        rows = table.find_elements(By.TAG_NAME, "tr")
        last_label = None
        for row in rows:
            try:
                ths = row.find_elements(By.TAG_NAME, "th")
                tds = row.find_elements(By.TAG_NAME, "td")
                if not ths or not tds:
                    continue

                label_raw = ths[0].text.strip().replace(":", "")
                if label_raw in ("", "\xa0"):
                    if last_label:
                        continuation = tds[0].text.strip()
                        if continuation:
                            prev = result["details"].get(last_label, "")
                            merged = (prev + " " + continuation).strip()
                            result["details"][last_label] = merged
                    continue

                value = tds[0].text.strip()
                result["details"][label_raw] = value
                last_label = label_raw
            except Exception:
                continue

    return result



# ============================================================
# 8️⃣ Main entry point
# ============================================================
def main(turn=0):
    
    auctions_info = []
    config = load_env()
    conn = connect_db(config)
    print("Env loaded")
    data=get_from_and_to(conn)
    from_date = data["from"]
    to_date = data["to"]
    if turn>3:
        from_date=None
        to_date=None
    driver = setup_driver(config)
    try:
        if driver:
            login(config, driver, BASE_URL)
            wait_until_notice_gone(driver)
            quick_search_handler(driver, from_date, to_date)
            links = scrape_links_from_table(driver)
            i=0
            for link in links:
                data=extract_auction_and_case(driver, link)
                auctions_info.append(data)
                print("Get ", i+1, " auction")
                i=i+1
                
        save_auctions_to_db(auctions_info, conn)
        save_auctions_to_excel(auctions_info)
        return len(auctions_info)
    finally:
        if driver:
            driver.quit()
        if conn:
            conn.close()
        print("✅ Scraper finished.")
        
def run_scraper():
    try:
        no_of_rows=0
        try:
            no_of_rows = main()
        except:
            print("Scraper Failed on initail try")
        if no_of_rows > 0:
            return no_of_rows   # ✅ return instead of sys.exit

        for i in range(5):
            try:
                no_of_rows = main(i)
                print("Sucessuflly Completed!")
            except:
                print(f"Scraper failed in {i+1} try")
            if no_of_rows > 0:
                return no_of_rows   # ✅ return instead of sys.exit

        return 0  # nothing inserted

    except Exception as e:
        print("Error in main ", e)
        return 0

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("Error in main ", e)
