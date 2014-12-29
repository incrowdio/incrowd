import importlib
import json
import logging
import re

from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
import urllib3

logger = logging.getLogger(__name__)

content_types = {
    'image': [
        'website.content_types.Imgur',
        'website.content_types.Image'
    ],
    'video': [
        'website.content_types.YouTube',
        'website.content_types.Video'
    ],
    'link': [
        'website.content_types.Link'
    ]
}


def get_class_from_string(class_name):
    module_name, cls_name = class_name.rsplit(".", 1)
    module = importlib.import_module(module_name)
    return getattr(module, cls_name)


def detect_post_type(url=None):
    # Default
    if not url:
        return 'text'
    else:
        return detect_link_type(url)


def find_urls(text):
    """Find any URLs in the given text, return a list of them"""
    return re.findall('http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\(\),]|'
                      '(?:%[0-9a-fA-F][0-9a-fA-F]))+', text)


def detect_link_type(url):
    """Given a link, get the HEAD and match to known types"""
    logger.info("Detecting content type of {}".format(url))

    # Get mime type of remote url
    try:
        http = urllib3.PoolManager()
        response = http.request('HEAD', url)
        content_type = response.headers.get('content-type')
    except Exception as e:
        logger.warning("Could not detect content type. Defaulting to "
                       "link for url: {}, exception: {}".format(url, e))
        return 'link'

    # Find list of content detectors based on mime
    if content_type in settings.MIME_IMAGES:
        key = 'image'
    elif content_type in settings.MIME_VIDEO or 'youtube.com' in url:
        key = 'video'
    elif url:
        key = 'link'
    else:
        return 'text'
    logger.info('content type is {}'.format(key))

    # Go through content detectors in order, returning if any matches
    for content_type in content_types[key]:
        cls = get_class_from_string(content_type)()
        detected_type = cls.detect(url, content_type)
        if detected_type:
            return detected_type


def url_filter(text):
    """Given a block of text, add HTML for links and embedded content."""
    attachment_type = None
    attachment_url = None
    # Search for images to render
    urls = find_urls(text)

    # Render the first
    logger.debug('Looking for image links in message {}'.format(
        text))
    if urls and detect_link_type(urls[0]) == 'image':
        logger.info('found image link in message: {}'.format(urls[0]))
        attachment_type = 'image'
        attachment_url = urls[0]

    # Make URLs into links
    for url in urls:
        logger.info('replacing extra urls: {}'.format(url))
        text = text.replace(
            url, '<a ng-href="{0}">{0}</a>'.format(url))
    return {
        'message': text,
        'attachment_type': attachment_type,
        'attachment_url': attachment_url
    }


def render_to_json(request, data):
    # msgs = {}
    # messages_list = messages.get_messages(request)
    # count = 0
    # for message in messages_list:
    # msgs[count] = {'message': message.message, 'level': message.level}
    #     count += 1
    # data['messages'] = msgs
    return HttpResponse(
        json.dumps(data, ensure_ascii=False, cls=DjangoJSONEncoder),
        content_type=request.is_ajax() and "application/json" or "text/html"
    )
