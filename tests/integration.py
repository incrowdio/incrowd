import base64
import unittest

import requests

DEFAULT_USERNAME = 'admin'
DEFAULT_PASSWORD = 'pass'
BASE_URL = 'http://localhost:8000/api/v1'


class InCrowdBasicTests(unittest.TestCase):
    def setUp(self):
        basic_auth = base64.b64encode('{}:{}'.format(
            DEFAULT_USERNAME, DEFAULT_PASSWORD))
        response = requests.get('{}/token/'.format(BASE_URL), headers={
            "Authorization": "Basic {}".format(basic_auth)})
        self.token = response.json()['token']

    def _request(self, url, method="get", data=None):
        return getattr(requests, method)(
            '{}/{}'.format(BASE_URL, url),
            headers={"Authorization": "Token {}".format(
                self.token)}, data=data)

    def test_create_posts(self):
        response = self._request('posts/', 'post',
                                 {'title': 'Text Post', 'category': 1})
        self.assertEqual(201, response.status_code)

        # Link
        response = self._request('posts/', 'post',
                                 {'title': 'Text Post', 'category': 1,
                                  'link': 'http://www.google.com'})
        self.assertEqual(201, response.status_code)

        # Image
        response = self._request('posts/', 'post',
                                 {'title': 'Text Post', 'category': 1,
                                  'link': 'http://www.google.com'})
        self.assertEqual(201, response.status_code)


if __name__ == "__main__":
    unittest.main()
