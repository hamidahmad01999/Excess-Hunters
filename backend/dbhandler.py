from werkzeug.security import generate_password_hash
import pymysql
import re
import os
from werkzeug.security import check_password_hash
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

def get_connection(db=None):
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=db,
        cursorclass=pymysql.cursors.DictCursor,
        charset='utf8mb4'
    )

def create_database_and_table():
    # Connect without DB to create DB if not exists
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(f"""
                CREATE DATABASE IF NOT EXISTS {DB_NAME} 
                CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
            """)
        conn.commit()
    finally:
        conn.close()
    
    # Connect to DB and create users table if not exists
    conn = get_connection(DB_NAME)
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    username VARCHAR(255) NOT NULL,
                    dob DATE,
                    role VARCHAR(50) NOT NULL DEFAULT 'user'
                ) CHARACTER SET utf8mb4;
            """)
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS auctions (
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
                    Link VARCHAR(2083) UNIQUE
                )CHARACTER SET utf8mb4;
            """)
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scraper_logs (
                    id INT NOT NULL,
                    last_run_time DATETIME DEFAULT NULL,
                    last_auctions_inserted INT DEFAULT NULL,
                    last_run_status VARCHAR(50) DEFAULT NULL,
                    last_error_message TEXT DEFAULT NULL,
                    next_run_time DATETIME DEFAULT NULL,
                    daily_run_time VARCHAR(5) DEFAULT NULL,
                    next_run_from DATE DEFAULT NULL,
                    next_run_to DATE DEFAULT NULL,
                    daily_run_from DATE DEFAULT NULL,
                    daily_run_to DATE DEFAULT NULL,
                    PRIMARY KEY (id)
                )CHARACTER SET utf8mb4;
            """)
        
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO scraper_logs (
                id, last_run_time, last_auctions_inserted, last_run_status, 
                last_error_message, next_run_time, daily_run_time, 
                next_run_from, next_run_to, daily_run_from, daily_run_to
            ) SELECT
                1, NULL, 0, 'Unknown', '', NULL, NULL, NULL, NULL, NULL, NULL
             WHERE NOT EXISTS ( SELECT 1 FROM scraper_logs WHERE ID=1);
            """)

        conn.commit()
    finally:
        conn.close()

def validate_email(email):
    # Simple regex for email validation
    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return re.match(email_regex, email) is not None

def get_user_by_email(email):
    conn = get_connection(DB_NAME)
    try:
        with conn.cursor() as cursor:
            sql = "SELECT * FROM users WHERE email = %s"
            cursor.execute(sql, (email,))
            user = cursor.fetchone()
            return user
    finally:
        conn.close()

def verify_login(email, password):
    if not validate_email(email):
        return False, "Invalid email format.", None
    
    user = get_user_by_email(email)
    if not user:
        return False, "User not found.", None
    
    if check_password_hash(user['password_hash'], password):
        return True, None, {
            "email": user["email"],
            "name": user["username"],
            "role": user["role"]
        }
    else:
        return False, "Incorrect password.", None


def create_user(username, email, dob, password, role=None):
    
    if not (email):
        return False, "Invalid email format."

    # If role is not provided, set default to "user"
    if not role:
        role = "user"

    conn = get_connection(DB_NAME)
    try:
        with conn.cursor() as cursor:
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return False, "User with this email already exists."

            hashed_password = generate_password_hash(password)
            cursor.execute("""
                INSERT INTO users (email, password_hash, username, dob, role)
                VALUES (%s, %s, %s, %s, %s)
            """, (email, hashed_password, username, dob, role))
        conn.commit()
        return True, None
    finally:
        conn.close()

def get_all_users():
    conn = get_connection(DB_NAME)
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, username, email, role, dob FROM users")
            return cursor.fetchall()
    finally:
        conn.close()
        

def update_user(user_id, name=None, email=None, dob=None, role=None):
    try:
        conn = get_connection(DB_NAME)
        with conn.cursor() as cursor:
            fields = []
            values = []

            if name:
                fields.append("username=%s")
                values.append(name)
            if email:
                fields.append("email=%s")
                values.append(email)
            if dob:
                fields.append("dob=%s")
                values.append(dob)
            # don't need to append role
            # if role:
            #     fields.append("role=%s")
            #     values.append(role)

            if not fields:
                return False, "No fields to update"

            sql = f"UPDATE users SET {', '.join(fields)} WHERE id=%s"
            values.append(user_id)

            cursor.execute(sql, tuple(values))
        conn.commit()
        conn.close()
        return True, None
    except Exception as e:
        return False, str(e)

def delete_user(user_id):
    try:
        conn = get_connection(DB_NAME)
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))
        conn.commit()
        conn.close()
        return True, None
    except Exception as e:
        return False, str(e)
    
    
def get_user_by_id(user_id):

    try:
        conn = get_connection(DB_NAME)
        with conn.cursor() as cursor:
            sql = "SELECT id, username, email, dob, role FROM users WHERE id=%s"
            cursor.execute(sql, (user_id,))
            user = cursor.fetchone()
        conn.close()
        if user:
            return True, user
        else:
            return False, "User not found"
    except Exception as e:
        return False, str(e)

def get_total_users():
   
    try:
        conn = get_connection(DB_NAME)
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total FROM users")
            result = cursor.fetchone()
        conn.close()
        return True, result['total']
    except Exception as e:
        return False, str(e)

def get_total_auctions():
    
    try:
        conn = get_connection(DB_NAME)
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total FROM auctions")
            total = cursor.fetchone()['total']
            
        conn.close()
        return True, total
    except Exception as e:
        return False, str(e)

        
def get_auctions(page=1, items_per_page=20):

    try:
        conn = get_connection(DB_NAME)
        with conn.cursor() as cursor:
            # Total number of auctions
            cursor.execute("SELECT COUNT(*) AS total FROM auctions")
            total = cursor.fetchone()['total']

            total_pages = (total + items_per_page - 1) // items_per_page

            # If page is invalid, reset to first page
            if page < 1 or page > total_pages:
                page = 1

            offset = (page - 1) * items_per_page

            # Fetch auctions sorted by latest
            cursor.execute(
                "SELECT * FROM auctions ORDER BY id DESC LIMIT %s OFFSET %s",
                (items_per_page, offset)
            )
            auctions = cursor.fetchall()

        conn.close()

        return True, {
            "auctions": auctions,
            "total_auctions": total,
            "total_pages": total_pages,
            "current_page": page,
            "items_per_page": items_per_page
        }
    except Exception as e:
        return False, str(e)


def get_filtered_auctions(
    page=1,
    items_per_page=20,
    auction_type=None,
    auction_status=None,
    date_from=None,
    date_to=None,
    search=None
):
    """
    Fetch auctions with filters and search, supporting pagination or full data.
    Filters:
        - auction_type: filter by type
        - auction_status: filter by status
        - date_from / date_to: auction_date range
        - search: matches property_address, case_number, parcel_id
    Returns: (success, data)
    """
    try:
        conn = get_connection(DB_NAME)
        with conn.cursor() as cursor:
            # Base query
            query = "SELECT * FROM auctions WHERE 1=1"
            count_query = "SELECT COUNT(*) AS total FROM auctions WHERE 1=1"
            params = []
            count_params = []

            # Filters
            if auction_type:
                query += " AND AuctionType=%s"
                count_query += " AND AuctionType=%s"
                params.append(auction_type)
                count_params.append(auction_type)

            if auction_status:
                query += " AND AuctionStatus=%s"
                count_query += " AND AuctionStatus=%s"
                params.append(auction_status)
                count_params.append(auction_status)

            if date_from:
                query += " AND STR_TO_DATE(SUBSTRING_INDEX(AuctionDate, ' ', 1), '%%m/%%d/%%Y') >= %s"
                count_query += " AND STR_TO_DATE(SUBSTRING_INDEX(AuctionDate, ' ', 1), '%%m/%%d/%%Y') >= %s"
                params.append(date_from)
                count_params.append(date_from)

            if date_to:
                query += " AND STR_TO_DATE(SUBSTRING_INDEX(AuctionDate, ' ', 1), '%%m/%%d/%%Y') <= %s"
                count_query += " AND STR_TO_DATE(SUBSTRING_INDEX(AuctionDate, ' ', 1), '%%m/%%d/%%Y') <= %s"
                params.append(date_to)
                count_params.append(date_to)

            # Search
            if search:
                query += " AND (PropertyAddress LIKE %s OR CaseNo LIKE %s OR ParcelID LIKE %s)"
                count_query += " AND (PropertyAddress LIKE %s OR CaseNo LIKE %s OR ParcelID LIKE %s)"
                search_param = f"%{search}%"
                params.extend([search_param]*3)
                count_params.extend([search_param]*3)

            # Get total count
            cursor.execute(count_query, tuple(count_params))
            total = cursor.fetchone()['total']

            # Skip pagination if page or items_per_page is None
            if page is None or items_per_page is None:
                query += " ORDER BY id DESC"
                cursor.execute(query, tuple(params))
                auctions = cursor.fetchall()
                return True, {
                    "auctions": auctions,
                    "total_auctions": total,
                    "total_pages": 1,  # No pagination
                    "current_page": 1,
                    "items_per_page": total  # All rows
                }

            # Pagination logic
            total_pages = (total + items_per_page - 1) // items_per_page
            if page < 1 or page > total_pages:
                page = 1
            offset = (page - 1) * items_per_page
            query += " ORDER BY id DESC LIMIT %s OFFSET %s"
            params.extend([items_per_page, offset])
            cursor.execute(query, tuple(params))
            auctions = cursor.fetchall()

        conn.close()
        return True, {
            "auctions": auctions,
            "total_auctions": total,
            "total_pages": total_pages,
            "current_page": page,
            "items_per_page": items_per_page
        }
    except Exception as e:
        return False, str(e)       

def get_all_auction_status():
    conn = get_connection(DB_NAME)
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT DISTINCT AuctionStatus FROM auctions;")
            result = cursor.fetchall()
            statuses = [row["AuctionStatus"] for row in result]
            return statuses
        # return result
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()

# scraper database
def update_scraper_log(last_run_time, auctions_inserted, status, error_message):
    conn = get_connection(DB_NAME)
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE scraper_logs
                SET last_run_time = %s,
                    last_auctions_inserted = %s,
                    last_run_status = %s,
                    last_error_message = %s
                WHERE id = 1
            """, (last_run_time, auctions_inserted, status, error_message))
            conn.commit()
    finally:
        conn.close()
        
def get_scraper_details():
    conn = get_connection(DB_NAME)
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM scraper_logs WHERE id = 1")
            return cursor.fetchone()
    finally:
        conn.close()

def update_scraper_schedule(next_run_time, daily_run_time):
    conn = get_connection(DB_NAME)
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE scraper_logs
                SET next_run_time = %s,
                    daily_run_time = %s
                WHERE id = 1
            """, (next_run_time, daily_run_time))
            conn.commit()
    finally:
        conn.close()
        
def get_scraper_schedule():
    conn = get_connection(DB_NAME)
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT next_run_time, daily_run_time FROM scraper_logs WHERE id = 1")
            return cursor.fetchone()
    finally:
        conn.close()
        
        
        
def update_next_run_range(next_run_from, next_run_to):
    conn = get_connection(DB_NAME)
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE scraper_logs
                SET next_run_from = %s,
                    next_run_to = %s
                WHERE id = 1
            """, (next_run_from, next_run_to))
            conn.commit()
    finally:
        conn.close()

def update_daily_run_range(daily_run_from, daily_run_to):
    conn = get_connection(DB_NAME)
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE scraper_logs
                SET daily_run_from = %s,
                    daily_run_to = %s
                WHERE id = 1
            """, (daily_run_from, daily_run_to))
            conn.commit()
    finally:
        conn.close()