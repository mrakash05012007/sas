import sqlite3
import os

db_path = 'attendance.db'
if not os.path.exists(db_path):
    print(f"File not found: {db_path}")
else:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    try:
        c.execute('SELECT COUNT(*) FROM users')
        print(f'Users count: {c.fetchone()[0]}')
        c.execute('SELECT COUNT(*) FROM class_sessions')
        print(f'Sessions count: {c.fetchone()[0]}')
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()
