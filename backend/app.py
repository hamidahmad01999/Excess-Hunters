from flask import Flask, request, jsonify, make_response, send_file
from flask_cors import CORS
from dbhandler import create_database_and_table, verify_login, create_user, get_all_users, delete_user, update_user, get_user_by_id, get_total_users, get_total_auctions, get_auctions,get_filtered_auctions, get_all_auction_status, update_scraper_log, get_scraper_schedule,update_scraper_schedule, get_scraper_details
from werkzeug.middleware.proxy_fix import ProxyFix
import html
from datetime import datetime, timedelta
import jwt
import os
from dotenv import load_dotenv
# for scheduling scraper
from datetime import datetime
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from apscheduler.triggers.cron import CronTrigger
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from index import run_scraper as run_external_scraper
import csv
import io  

app = Flask(__name__)
SECRET_KEY = os.getenv('SECRET_KEY')
app.secret_key = SECRET_KEY  # Change in production
app.wsgi_app = ProxyFix(app.wsgi_app)

# Allow cookies from React frontend
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])  # Change for production

JWT_SECRET = SECRET_KEY  # Use env var in production
JWT_EXPIRATION_DAYS = 1

create_database_and_table()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.start()


# web APIs
@app.route("/")
def hello():
    return "Hello world"

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = html.escape(data.get('email', '').strip())
    password = data.get('password', '').strip()
    
    if email == "" or password == "":
        return jsonify({"success": False, "message": "Email and password cannot be empty"}), 400

    success, error_msg, user_data = verify_login(email, password)

    if success:
        # Create JWT payload
        payload = {
            "email": user_data["email"],
            "name": user_data["name"],
            "role": user_data["role"],
            "exp": datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

        # Create response and set HttpOnly cookie
        resp = make_response(jsonify({
            "success": True,
            "message": "Login successful",
            "email": user_data["email"],
            "name": user_data["name"],
            "role": user_data["role"]
        }))
        resp.set_cookie(
            "access_token",
            token,
            httponly=True,
            secure=False,  # True in production with HTTPS
            samesite="Lax",
            max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60
        )
        return resp

    return jsonify({"success": False, "message": error_msg}), 401


@app.route('/check-login', methods=['GET'])
def check_login():
    token = request.cookies.get("access_token")
    if not token:
        return jsonify({"logged_in": False}), 200

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        is_admin = False 
        if(decoded["role"]=="admin"):
            is_admin = True
        else:
            is_admin = False
            
        return True, is_admin
        
    except jwt.ExpiredSignatureError:
        return False, False
        # return jsonify({"logged_in": False, "message": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return False, False
        # return jsonify({"logged_in": False, "message": "Invalid token"}), 401


@app.route('/api/register', methods=['POST'])
def create_user_page():
    is_login, is_admin = check_login()
    if is_login and is_admin:
        data = request.get_json()
        username = data.get('username', '').strip()
        email = html.escape(data.get('email', '').strip())
        dob = data.get('dob', '').strip()
        password = data.get('password', '').strip()
        role = data.get('role', '').strip()
        print(username, email, dob,password, role)
        if email == "" or password == "":
            return jsonify({"success": False, "message": "Email and password cannot be empty"}), 400

        success, error_msg = create_user(username, email, dob, password, role)
        if success:
            return jsonify({"success": True, "message": "User created successfully!"}), 201
        else:
            return jsonify({"success": False, "message": error_msg}), 400
    else:
        return jsonify({"success": False, "message": "You are not allowed to create user"}), 401
        

@app.route('/api/logout', methods=['POST'])
def logout():
    resp = make_response(jsonify({"success": True, "message": "Logged out successfully"}))
    resp.set_cookie("access_token", "", expires=0, httponly=True)
    return resp

@app.route('/api/users', methods=['GET'])
def get_users():
    is_login, is_admin = check_login()
    if not is_login:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    if not is_admin:
        return jsonify({"success": False, "message": "Access denied"}), 403
    
    try:
        users = get_all_users()
        return jsonify({"success": True, "users": users}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def edit_user(user_id):
    is_login, is_admin = check_login()
    if not (is_login and is_admin):
        return jsonify({"success": False, "message": "Not authorized"}), 401

    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    dob = data.get('dob', '').strip()
    role = data.get('role', '').strip()

    success, error = update_user(user_id, name, email, dob, role)
    if success:
        return jsonify({"success": True, "message": "User updated successfully"}), 200
    else:
        return jsonify({"success": False, "message": error}), 500


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def remove_user(user_id):
    is_login, is_admin = check_login()
    if not (is_login and is_admin):
        return jsonify({"success": False, "message": "Not authorized"}), 401

    success, error = delete_user(user_id)
    if success:
        return jsonify({"success": True, "message": "User deleted successfully"}), 200
    else:
        return jsonify({"success": False, "message": error}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    is_login, is_admin = check_login()
    if not (is_login and is_admin):
        return jsonify({"success": False, "message": "Not authorized"}), 401
    print(is_login, is_admin)
    success, result = get_user_by_id(user_id)
    if success:
        return jsonify({"success": True, "user": result}), 200
    else:
        return jsonify({"success": False, "message": result}), 404


@app.route('/api/analysis', methods=['GET'])
def analysis():
    # Only allow admin
    is_login, is_admin = check_login()
    if not (is_login and is_admin):
        return jsonify({"success": False, "message": "Not authorized"}), 401

    success_users, total_users = get_total_users()
    success_auctions, total_auctions = get_total_auctions()

    if not success_users:
        return jsonify({"success": False, "message": total_users}), 500
    if not success_auctions:
        return jsonify({"success": False, "message": total_auctions}), 500

    return jsonify({
        "success": True,
        "total_users": total_users,
        "total_auctions": total_auctions
    }), 200
    

@app.route('/api/auctions-status', methods=['GET'])
def auction_status():
    try:
        is_login, _ = check_login()
        if not is_login:
            return jsonify({"success": False, "message": "Not authorized"}), 401
        statuses = get_all_auction_status()
        return jsonify({"auction_status": statuses}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/api/auctions', methods=['GET'])
def fetch_auctions():
    # Only logged-in users
    is_login, _ = check_login()
    if not is_login:
        return jsonify({"success": False, "message": "Not authorized"}), 401

    # Query params
    page = int(request.args.get("page", 1))
    auction_type = request.args.get("auction_type")
    auction_status = request.args.get("auction_status")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    search = request.args.get("search")

    success, data = get_filtered_auctions(
        page=page,
        items_per_page=10,
        auction_type=auction_type,
        auction_status=auction_status,
        date_from=date_from,
        date_to=date_to,
        search=search
    )

    if success:
        return jsonify({"success": True, **data}), 200
    else:
        return jsonify({"success": False, "message": data}), 500

@app.route('/api/auctions/download', methods=['GET'])
def download_auctions():
    is_login = check_login()
    if not is_login:
        return jsonify({"success": False, "message": "Not authorized"}), 401

    auction_type = request.args.get("auction_type")
    auction_status = request.args.get("auction_status")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    search = request.args.get("search")

    success, data = get_filtered_auctions(
        page=None,  # No pagination for download
        items_per_page=None,
        auction_type=auction_type,
        auction_status=auction_status,
        date_from=date_from,
        date_to=date_to,
        search=search
    )

    if not success:
        return jsonify({"success": False, "message": data}), 500

    auctions = data["auctions"]
    if not auctions:
        return jsonify({"success": False, "message": "No data to download"}), 404

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers (assuming auctions table columns)
    headers = auctions[0].keys()
    writer.writerow(headers)
    
    # Write data rows
    for auction in auctions:
        writer.writerow([auction.get(header, "") for header in headers])

    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f"auctions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    )

# scraper code
def run_scraper():
    try:
        auctions_inserted = run_external_scraper()
        update_scraper_log(datetime.now(), auctions_inserted, "Success", "")
        logger.info("Scraper ran successfully")
    except Exception as e:
        update_scraper_log(datetime.now(), 0, "Failed", str(e))
        logger.error(f"Scraper error: {e}")

def schedule_scraper():
    try:
        result = get_scraper_schedule()
        if not result:
            logger.error("No scraper schedule found in database")
            return

        scheduler.remove_all_jobs()

        if result["next_run_time"]:
            try:
                next_run_time = result["next_run_time"]
                # Check if next_run_time is already a datetime object
                if isinstance(next_run_time, datetime):
                    parsed_next_run_time = next_run_time
                else:
                    parsed_next_run_time = datetime.strptime(next_run_time, "%Y-%m-%d %H:%M:%S")
                
                if parsed_next_run_time > datetime.now():
                    scheduler.add_job(
                        run_scraper,
                        trigger=DateTrigger(run_date=parsed_next_run_time),
                        id="next_run"
                    )
                    logger.info(f"Scheduled one-time run at {parsed_next_run_time}")
            except ValueError:
                logger.error("Invalid next_run_time format")

        if result["daily_run_time"]:
            try:
                hour, minute = map(int, result["daily_run_time"].split(":"))
                scheduler.add_job(
                    run_scraper,
                    trigger=CronTrigger(hour=hour, minute=minute),
                    id="daily_run"
                )
                logger.info(f"Scheduled daily run at {result['daily_run_time']}")
            except ValueError:
                logger.error("Invalid daily_run_time format")
    except Exception as e:
        logger.error(f"Error scheduling scraper: {e}")


@app.route("/api/scraper/details", methods=["GET"])
def get_scraper_details_route():
    try:
        is_login, _ = check_login()
        if not is_login:
            return jsonify({"success": False, "message": "Not authorized"}), 401
        result = get_scraper_details()
        return jsonify({
            "success": True,
            "last_run_time": str(result["last_run_time"]) if result["last_run_time"] else None,
            "last_auctions_inserted": result["last_auctions_inserted"],
            "last_run_status": result["last_run_status"],
            "last_error_message": result["last_error_message"],
            "next_run_time": str(result["next_run_time"]) if result["next_run_time"] else None,
            "daily_run_time": str(result["daily_run_time"]) if result["daily_run_time"] else None,
            "next_run_from": str(result["next_run_from"]) if result["next_run_from"] else None,
            "next_run_to": str(result["next_run_to"]) if result["next_run_to"] else None,
            "daily_run_from": str(result["daily_run_from"]) if result["daily_run_from"] else None,
            "daily_run_to": str(result["daily_run_to"]) if result["daily_run_to"] else None
        })
    except Exception as e:
        logger.error(f"Error fetching scraper details: {e}")
        return jsonify({"success": False, "message": "Failed to fetch scraper details"}), 500
    
    
@app.route("/api/scraper/start", methods=["POST"])
def start_scraper():
    try:
        is_login, _ = check_login()
        if not is_login:
            return jsonify({"success": False, "message": "Not authorized"}), 401
        run_scraper()
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"Error starting scraper: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    
    
@app.route("/api/scraper/schedule", methods=["POST"])
def set_scraper_schedule():
    try:
        is_login, _ = check_login()
        if not is_login:
            return jsonify({"success": False, "message": "Not authorized"}), 401
        data = request.get_json()
        next_run_time = data.get("next_run_time")
        daily_run_time = data.get("daily_run_time")
        formatted_next_run_time = None
        if next_run_time:
            try:
                formatted_next_run_time = datetime.strptime(next_run_time, "%Y-%m-%dT%H:%M").strftime("%Y-%m-%d %H:%M:%S")
            except ValueError:
                return jsonify({"success": False, "message": "Invalid next_run_time format"}), 400
        formatted_daily_run_time = None
        if daily_run_time:
            try:
                datetime.strptime(daily_run_time, "%H:%M")
                formatted_daily_run_time = daily_run_time
            except ValueError:
                return jsonify({"success": False, "message": "Invalid daily_run_time format"}), 400
            
        # Validation: Ensure next_run_time and daily_run_time are not within 10 minutes
        if formatted_next_run_time and formatted_daily_run_time:
            next_run_dt = datetime.strptime(formatted_next_run_time, "%Y-%m-%d %H:%M:%S")
            today = datetime.now().date()
            daily_run_dt = datetime.strptime(f"{today} {formatted_daily_run_time}:00", "%Y-%m-%d %H:%M:%S")
            
            time_diff = abs((next_run_dt - daily_run_dt).total_seconds())
            if time_diff < 600:  # 10 minutes = 600 seconds
                return jsonify({
                    "success": False,
                    "message": "next_run_time and daily_run_time cannot be the same or within 10 minutes of each other"
                }), 400
        update_scraper_schedule(formatted_next_run_time, formatted_daily_run_time)
        schedule_scraper()
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"Error setting scraper schedule: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@app.route("/api/scraper/next_run_range", methods=["POST"])
def set_next_run_range():

    try:
        is_login, _ = check_login()
        if not is_login:
            return jsonify({"success": False, "message": "Not authorized"}), 401
        data = request.get_json()
        next_run_from = data.get("next_run_from")  # e.g., "2025-08-17"
        next_run_to = data.get("next_run_to")      # e.g., "2025-08-20"
        formatted_next_run_from = None
        if next_run_from:
            try:
                formatted_next_run_from = datetime.strptime(next_run_from, "%Y-%m-%d").strftime("%Y-%m-%d")
            except ValueError:
                return jsonify({"success": False, "message": "Invalid next_run_from format"}), 400

        formatted_next_run_to = None
        if next_run_to:
            try:
                formatted_next_run_to = datetime.strptime(next_run_to, "%Y-%m-%d").strftime("%Y-%m-%d")
            except ValueError:
                return jsonify({"success": False, "message": "Invalid next_run_to format"}), 400

        update_next_run_range(formatted_next_run_from, formatted_next_run_to)
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"Error setting next run range: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/api/scraper/daily_run_range", methods=["POST"])
def set_daily_run_range():

    try:
        is_login, _ = check_login()
        if not is_login:
            return jsonify({"success": False, "message": "Not authorized"}), 401
        data = request.get_json()
        daily_run_from = data.get("daily_run_from")  # e.g., "2025-08-17"
        daily_run_to = data.get("daily_run_to")      # e.g., "2025-08-20"
        formatted_daily_run_from = None
        if daily_run_from:
            try:
                formatted_daily_run_from = datetime.strptime(daily_run_from, "%Y-%m-%d").strftime("%Y-%m-%d")
            except ValueError:
                return jsonify({"success": False, "message": "Invalid daily_run_from format"}), 400

        formatted_daily_run_to = None
        if daily_run_to:
            try:
                formatted_daily_run_to = datetime.strptime(daily_run_to, "%Y-%m-%d").strftime("%Y-%m-%d")
            except ValueError:
                return jsonify({"success": False, "message": "Invalid daily_run_to format"}), 400

        update_daily_run_range(formatted_daily_run_from, formatted_daily_run_to)
        return jsonify({"success": True})
    except Exception as e:
        logger.error(f"Error setting daily run range: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


if __name__ == '__main__':
    schedule_scraper()
    app.run(debug=True)
