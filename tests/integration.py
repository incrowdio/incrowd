import base64
import os
import unittest

import requests

DEFAULT_USERNAME = 'admin'
DEFAULT_PASSWORD = 'pass'
DOCKER_HOSTNAME = os.environ.get('DOCKER_HOSTNAME', 'localhost')
BASE_URL = 'http://{}:8000/api/v1'.format(DOCKER_HOSTNAME)


class InCrowdBasicTests(unittest.TestCase):
    def setUp(self):
        basic_auth = base64.b64encode('{}:{}'.format(
            DEFAULT_USERNAME, DEFAULT_PASSWORD))
        response = requests.get('{}/token/'.format(BASE_URL), headers={
            "Authorization": "Basic {}".format(basic_auth)})
        self.token = response.json()['token']
        print "token {}".format(self.token)

    def _request(self, url, method="get", data=None):
        return getattr(requests, method)(
            '{}/{}'.format(BASE_URL, url),
            headers={"Authorization": "Token {}".format(
                self.token)}, data=data)

    def test_posts(self):
        self._test_posts()
        self._test_comments()

    def _test_posts(self):
        response = self._request('posts/', 'post',
                                 {'title': 'Text Post', 'category': 1})
        self.assertEqual(201, response.status_code)

        # Link
        response = self._request('posts/', 'post',
                                 {'title': 'Link Post', 'category': 1,
                                  'link': 'http://www.google.com'})
        self.assertEqual(201, response.status_code)

        # Image
        response = self._request('posts/', 'post',
                                 {'title': 'Image Post', 'category': 1,
                                  'link': 'http://www.google.com'})
        self.assertEqual(201, response.status_code)
        # Ensure we get back 3 posts, in order.
        response = self._request('posts/')
        self.assertEqual(200, response.status_code)
        # 3 new posts + welcome post = 4
        posts = response.json()['results']
        self.assertEqual(4, len(posts))
        self.assertEqual('Welcome!', posts[3]['title'])
        self.assertEqual('Image Post', posts[0]['title'])

        # Attempt to remove a post
        response = self._request('posts/{}/'.format(posts[3]['id']), 'delete')
        self.assertEqual(204, response.status_code)

        # Check we only have 3 posts not
        response = self._request('posts/')
        self.assertEqual(200, response.status_code)

        # 3 new posts + welcome post - deleted post = 3
        posts = response.json()['results']
        self.assertEqual(3, len(posts))
        self.assertEqual('Text Post', posts[2]['title'])

    def _test_comments(self):
        # Get the posts
        response = self._request('posts/')
        self.assertEqual(200, response.status_code)
        posts = response.json()['results']

        # Add a couple of comments
        response = self._request('comments/'.format(posts[0]['id']), 'post',
                                 {'text': 'Sweet post!',
                                  'post': posts[0]['id']})
        self.assertEqual(201, response.status_code)
        response = self._request('comments/'.format(posts[0]['id']), 'post',
                                 {'text': 'Like, really deep!',
                                  'post': posts[0]['id']})
        self.assertEqual(201, response.status_code)
        response = self._request('comments/'.format(posts[1]['id']), 'post',
                                 {'text': 'This post is even deeper!t',
                                  'post': posts[1]['id']})
        self.assertEqual(201, response.status_code)

        # List comments via comments endpoint
        response = self._request('comments/')
        self.assertEqual(200, response.status_code)

        comments = response.json()['results']
        self.assertEqual(3, len(comments))

        # List comments in the post
        response = self._request('posts/{}/'.format(posts[0]['id']))
        self.assertEqual(200, response.status_code)
        comments = response.json()['comment_set']
        self.assertEqual(2, len(comments))
        self.assertEqual('Like, really deep!', comments[1]['text'])

        # Delete a comment now
        response = self._request('comments/{}/'.format(comments[1]['id']),
                                 'delete')
        self.assertEqual(204, response.status_code)

        # Check the comments again
        response = self._request('posts/{}/'.format(posts[0]['id']))
        self.assertEqual(200, response.status_code)
        comments = response.json()['comment_set']
        self.assertEqual(1, len(comments))
        self.assertEqual('Sweet post!', comments[0]['text'])


if __name__ == "__main__":
    unittest.main()
