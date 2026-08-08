#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path


def main():
    """Run administrative tasks."""
    # Tell Python to search inside the 'backend' folder for modules
    BASE_DIR = Path(__file__).resolve().parent
    sys.path.append(str(BASE_DIR / 'backend'))

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'freight_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()