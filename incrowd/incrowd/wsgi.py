"""
WSGI config for incrowd project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/howto/deployment/wsgi/
"""

import logging
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "incrowd.settings")
logger = logging.getLogger()

try:
    import newrelic.agent

    logger.info('initializing with new relic')
    newrelic.agent.initialize(os.path.abspath('config/newrelic.ini'))
except Exception:
    logger.info('running without newrelic')

application = get_wsgi_application()
