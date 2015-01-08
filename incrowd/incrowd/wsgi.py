"""
WSGI config for incrowd project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/howto/deployment/wsgi/
"""

import logging
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "incrowd.settings")
logger = logging.getLogger()

try:
    import newrelic.agent
    logger.info('initializing with new relic')
    newrelic.agent.initialize(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__), 'config/newrelic.ini'))))
except Exception:
    logger.info('running without newrelic')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
