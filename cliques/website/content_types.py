import urlparse


class ContentType(object):
    def detect(self, url, content_type):
        pass

    def render(self):
        return None


class Video(ContentType):
    def detect(self, url, content_type):
        return 'video'


class Image(ContentType):
    def detect(self, url, content_type):
        return 'image'


class YouTube(Video):
    def detect(self, url, content_type):
        url_data = urlparse.urlparse(url)
        query = urlparse.parse_qs(url_data.query)
        if len(query.get("v", [])) > 0:
            # return query["v"][0]
            return 'youtube'

    def youtube_video_id(self, url):
        url_data = urlparse.urlparse(url)
        query = urlparse.parse_qs(url_data.query)
        if len(query.get("v", [])) > 0:
            return query["v"][0]


class Imgur(ContentType):
    def detect(self, url, content_type):
        url_data = urlparse.urlparse(url)
        if url_data.netloc == 'imgur.com':
            return 'imgur'


class Link(ContentType):
    def detect(self, url, content_type):
        return 'link'
