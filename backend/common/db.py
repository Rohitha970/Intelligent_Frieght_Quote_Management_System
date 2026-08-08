from django.db import connection

def execute_custom_query(query, params=None):
    """Helper method for running raw queries across modules if needed."""
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        if query.strip().lower().startswith('select'):
            return cursor.fetchall()
        return cursor.rowcount