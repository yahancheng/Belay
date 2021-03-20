from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
from functools import wraps
import mysql.connector
import bcrypt
import configparser
import io
import string
import random

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

config = configparser.ConfigParser()
config.read('secrets.cfg')
DB_NAME = 'yahancheng'
DB_USERNAME = config['secrets']['DB_USERNAME']
DB_PASSWORD = config['secrets']['DB_PASSWORD']
PEPPER = config['secrets']['PEPPER']


@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/chat/<int:chat_id>')
def chat(chat_id):
    return app.send_static_file('index.html')


@app.route('/api/signup', methods=['POST'])
def signup ():
    body = request.get_json()
    username = body['username']
    password = (body['password']+PEPPER).encode('utf-8')
    email = body['email']
    hashed = bcrypt.hashpw(password, bcrypt.gensalt())

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    query_insert = "INSERT INTO users (username, password, email, token) VALUES (%s, %s, %s, %s)"
    query_select_id = "SELECT id FROM users WHERE email=%s"
    query_channel_id = "SELECT id FROM channels"
    query_unreads = "INSERT INTO unreads(user_id, channel_id, last_message_id) VALUES "
    session_token = ''.join(random.choices(string.ascii_lowercase + string.digits, k=20))

    try:
        cursor.execute(query_insert, (username, hashed, email, session_token))
        cursor.execute(query_select_id, (email,))
        user_id = cursor.fetchone()[0]
        cursor.execute(query_channel_id)
        channel_ids = [item[0] for item in cursor.fetchall()]

        if channel_ids:
            for cid in channel_ids:
                print()
                query_unreads += "(%d, %d, %d), " % (user_id, cid, 0)
            query_unreads = query_unreads[:-2]
            cursor.execute(query_unreads)

        connection.commit()
        return jsonify({"token": session_token, "user_id": user_id}), 200
    except Exception as e:
        print(e)
        return jsonify({}), 302
    finally:
        cursor.close()
        connection.close()


@app.route('/api/login', methods=['POST'])
def login ():
    body = request.get_json()
    email = body['email']
    password = body['password']

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    query = "SELECT * FROM users WHERE email=%s"
    query_token = "UPDATE users SET token = %s WHERE id = %s"
    session_token = ''.join(random.choices(string.ascii_lowercase + string.digits, k=20))

    try:
        cursor.execute(query, (email,))
        user_id, _, _, pwd, _ = cursor.fetchone()

        if cursor.rowcount == 0:
            connection.commit()
            return jsonify({}), 302
        
        if bcrypt.checkpw((password+PEPPER).encode('utf-8'), pwd.encode('utf-8')):
            print("match")
            cursor.execute(query_token, (session_token, user_id))
            connection.commit()
            return jsonify({"token": session_token, "user_id": user_id}), 200

        else:
            print("does not match")
            connection.commit()
            return jsonify({}), 302
        
    except Exception as e:
        print(e)
        return jsonify({}), 302
    finally:
        cursor.close()
        connection.close()


@app.route('/api/editEmail', methods=['POST'])
def editEmail ():
    body = request.get_json()
    email = body['email']
    user_id = body['user_id']
    token = body['token']

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    query = 'UPDATE users SET email = %s WHERE id = %s AND token = %s'

    try:
        cursor.execute(query, (email, user_id, token))
        connection.commit()
        return jsonify({}), 200
    except Exception as e:
        print(e)
        return jsonify({}), 302
    finally:
        cursor.close()
        connection.close()

@app.route('/api/editUsername', methods=['POST'])
def editUsername ():
    body = request.get_json()
    user_id = body['user_id']
    username = body['username']
    token = body['token']

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    query = 'UPDATE users SET username = %s WHERE id = %s AND token = %s'

    try:
        cursor.execute(query, (username, user_id, token))
        connection.commit()
        return jsonify({}), 200
    except Exception as e:
        print(e)
        return jsonify({}), 302
    finally:
        cursor.close()
        connection.close()


@app.route('/api/editPassword', methods=['POST'])
def editPassword ():
    body = request.get_json()
    user_id = body['user_id']
    old_password = body['oldPassword']
    new_password = body['newPassword']
    token = body['token']

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor()

    query_user = "SELECT * FROM users WHERE id = %s AND token = %s"

    query_reset_password = 'UPDATE users SET password = %s WHERE id = %s'

    try:
        cursor.execute(query_user, (user_id, token))
        pwd = cursor.fetchone()[3]

        if cursor.rowcount == 0:
            connection.commit()
            return jsonify({}), 302
        
        elif bcrypt.checkpw((old_password+PEPPER).encode('utf-8'), pwd.encode('utf-8')):
            print("match")
            password = (new_password+PEPPER).encode('utf-8')
            hashed = bcrypt.hashpw(password, bcrypt.gensalt())
            cursor.execute(query_reset_password, (hashed, user_id))
            connection.commit()
            return jsonify({}), 200

        else:
            print("does not match")
            connection.commit()
            return jsonify({}), 302

        connection.commit()
    except Exception as e:
        print(e)
        return jsonify({}), 302
    finally:
        cursor.close()
        connection.close()


@app.route('/api/channel', methods=['GET', 'POST'])
def channel ():
    if request.method == 'POST':
        body = request.get_json()
        new_channel = body['channel']
        user_id = body['user_id']
        token = body['token']

        connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
        cursor = connection.cursor()

        time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        query_compare_token = "SELECT * FROM users WHERE id = %s AND token = %s"
        query_add_channel = "INSERT INTO channels (name, user_id, time) VALUES (%s, %s, %s)"
        query_channel_id = "SELECT id FROM channels WHERE name = %s"
        query_users = "SELECT id FROM users"
        query_unreads = "INSERT INTO unreads(user_id, channel_id, last_message_id) VALUES "
        
        try:
            cursor.execute(query_compare_token, (user_id, token))
            if not cursor.fetchone():
                return jsonify({}), 302
            
            cursor.execute(query_add_channel, (new_channel, user_id, time))
            cursor.execute(query_channel_id, (new_channel, ))
            channel_id = cursor.fetchone()[0]
            cursor.execute(query_users)

            for uid in cursor.fetchall():
                query_unreads += "(%d, %d, %d), " % (uid[0], channel_id, 0)
            query_unreads = query_unreads[:-2]

            cursor.execute(query_unreads)

            connection.commit()
            return jsonify({}), 200
        except Exception as e:
            print(e)
            return jsonify({}), 302
        finally:
            cursor.close()
            connection.close()
    

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor(buffered=True)
    user_id = request.headers['user_id']

    query = "SELECT * FROM channels"
    query_unread = '''SELECT count(*) AS num, a.channel_id FROM
        (SELECT id, channel_id FROM messages WHERE parent_id = 0) a
        LEFT JOIN
        (SELECT channel_id, last_message_id FROM unreads WHERE user_id = %s) b
        ON a.channel_id = b.channel_id
        WHERE a.id > b.last_message_id
        GROUP BY a.channel_id;'''

    try:
        cursor.execute(query)
        id_list = []
        name_list = []
        for channel_id, channel_name, _, _ in cursor.fetchall():
            id_list.append(channel_id)
            name_list.append(channel_name)

        unread_map = {}
        cursor.execute(query_unread, (user_id, ))
        for item in cursor.fetchall():
            unread_map[item[1]] = item[0]
        
        unread_list = []
        for cid in id_list:
            if cid not in unread_map:
                unread_list.append(0)
            else:
                unread_list.append(unread_map[cid])
        
        connection.commit()
        return jsonify({"channelList": name_list, "idList": id_list, "unreadList": unread_list}), 200
    except Exception as e:
        print(e)
        return jsonify({}), 302
    finally:
        cursor.close()
        connection.close()


@app.route('/api/deleteChannel', methods=['POST'])
def deleteChannel ():
    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor(buffered=True)

    body = request.get_json()
    user_id = body['user_id']
    channel_id = body['channel_id']
    token = body['token']
    message = ""

    query_compare_token = "SELECT * FROM users WHERE id = %s AND token = %s"
    query_check = "SELECT user_id FROM channels WHERE id = %s"
    query_channels = "DELETE FROM channels WHERE id = %s"
    query_messages = "DELETE FROM messages WHERE channel_id = %s"
    query_unreads = "DELETE FROM unreads WHERE channel_id = %s"

    try:
        cursor.execute(query_compare_token, (user_id, token))
        if not cursor.fetchone():
            return jsonify({}), 302
    
        cursor.execute(query_check, (channel_id, ))
        channel_owner = cursor.fetchone()[0]

        if channel_owner == user_id:
            cursor.execute(query_channels, (channel_id, ))
            cursor.execute(query_messages, (channel_id, ))
            cursor.execute(query_unreads, (channel_id, ))
            message = "Channel deleted"
        else:
            message = "Sorry! Only the owner can delete channel"

        connection.commit()

        return jsonify({"message": message}), 200
    except Exception as e:
        print(e)
        return jsonify({}), 302
    finally:
        cursor.close()
        connection.close()



@app.route('/api/message', methods=['GET', 'POST'])
def messages ():
    if request.method == 'GET':
        channel_id = request.headers['channelId']
        user_id = request.headers['userId']
        query_messages = '''
        SELECT id, channel_id, user_id, a.parent_id, body, time, reply_num FROM
            (SELECT COUNT(*) AS reply_num, parent_id FROM messages GROUP BY parent_id) a
        RIGHT JOIN
            (SELECT * FROM messages WHERE channel_id = %s AND parent_id = 0) b
        ON a.parent_id = b.id;
        '''
        query_users = "SELECT id, username FROM users"
        query_unreads = "UPDATE unreads SET last_message_id = %s WHERE user_id = %s AND channel_id = %s" 

        connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
        cursor = connection.cursor(buffered=True)
        
        try:
            cursor.execute(query_messages, (channel_id,))
            msg_ids = []
            user_ids = []
            messages = []
            reply_num = []
            for item in cursor.fetchall():
                msg_ids.append(item[0])
                user_ids.append(item[2])
                messages.append(item[4])
                reply_num.append(0 if not item[6] else item[6])

            cursor.execute(query_users)
            user_dict = {}
            for item in cursor.fetchall():
                user_dict[item[0]] = item[1]
            users_name = [(user_dict[x]) for x in user_ids]

            if (msg_ids):
                max_msg_id = max(msg_ids)
                cursor.execute(query_unreads, (max_msg_id, user_id, channel_id))
                connection.commit()

            return jsonify({
                "messages": messages, 
                "msg_id": msg_ids, 
                "users": users_name,
                "channel_id": channel_id,
                "reply_num": reply_num}), 200
        except Exception as e:
            print(e)
            return jsonify({}), 302
        finally:
            cursor.close()
            connection.close()

    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor(buffered=True)

    body = request.get_json()
    user_id = body['user_id']
    channel_id = body['channel_id']
    msg = body['msg']
    token = body['token']
    time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    parent_id = body['parent_id'] if 'parent_id' in body else 0

    query_compare_token = "SELECT * FROM users WHERE id = %s AND token = %s"
    query_add_msg = "INSERT INTO messages (channel_id, user_id, parent_id, body, time) VALUES (%s, %s, %s, %s, %s)"

    try:
        cursor.execute(query_compare_token, (user_id, token))
        if not cursor.fetchone():
            print("token not match", token)
            return jsonify({}), 302

        cursor.execute(query_add_msg, (channel_id, user_id, parent_id, msg, time))
        connection.commit()
        return jsonify({}), 200
    except Exception as e:
        print(e)
        return jsonify({}), 302
    finally:
        cursor.close()
        connection.close()


@app.route('/api/thread', methods=['GET', 'POST'])
def thread():
    if request.method == 'GET':
        msg_id = request.headers['msg_id']
        query_main_message = 'SELECT * FROM messages WHERE id = %s'
        query_thread = 'SELECT * FROM messages WHERE parent_id = %s'
        query_users = "SELECT id, username FROM users"

        connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
        cursor = connection.cursor(buffered=True)

        try:
            cursor.execute(query_main_message, (msg_id, ))
            item = cursor.fetchone()
            mainUser, mainMsg = item[2], item[4]

            cursor.execute(query_thread, (msg_id, ))
            user_ids = []
            messages = []
            for item in cursor.fetchall():
                user_ids.append(item[2])
                messages.append(item[4])
            
            cursor.execute(query_users)
            user_dict = {}
            for item in cursor.fetchall():
                user_dict[item[0]] = item[1]

            users_name = [(user_dict[x]) for x in user_ids]
            mainUser = user_dict[mainUser]

            connection.commit()

            return jsonify({
                "messages": messages, 
                "users": users_name,
                "mainUser": mainUser,
                "mainMsg": mainMsg}), 200

        except Exception as e:
            print(e)
            return jsonify({}), 302
        finally:
            cursor.close()
            connection.close()
    
    connection = mysql.connector.connect(user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
    cursor = connection.cursor(buffered=True)

    body = request.get_json()
    user_id = body['user_id']
    channel_id = body['channel_id']
    parent_id = body['parent_id']
    msg = body['msg']
    token = body['token']
    time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    query_compare_token = "SELECT * FROM users WHERE id = %s AND token = %s"
    query_add_msg = "INSERT INTO messages (channel_id, user_id, parent_id, body, time) VALUES (%s, %s, %s, %s, %s)"


    try:
        cursor.execute(query_compare_token, (user_id, token))
        if not cursor.fetchone():
            return jsonify({}), 302

        cursor.execute(query_add_msg, (channel_id, user_id, parent_id, msg, time))
        connection.commit()
        return jsonify({}), 200
    except Exception as e:
        print(e)
        return jsonify({}), 302
    finally:
        cursor.close()
        connection.close()
    

