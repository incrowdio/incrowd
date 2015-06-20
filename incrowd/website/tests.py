from django.core.urlresolvers import reverse
from django.test import override_settings
import mock
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

from website.api import PostViewSet
from website.models import Category, Crowd, UserProfile


@override_settings(PUSH_DISABLED=True)
class PostTests(APITestCase):
    def setUp(self):
        self.crowd = Crowd(name='test_crowd')
        self.crowd.save()

        self.user = UserProfile(username='test', email='test@example.com',
                                password='password', crowd=self.crowd)
        self.user.save()

        # Include an appropriate `Authorization:` header on all requests.
        self.token = Token(user=self.user)
        self.token.save()

        self.category = Category(created_by=self.user,
                                 name='test_category',
                                 color='red', crowd=self.crowd)
        self.category.save()

        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        self.viewset = PostViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        })

    def _get_response(self, urllib_mock, content_type):
        urllib_mock.headers.get.return_value = content_type
        return urllib_mock

    @mock.patch('website.models.Post._new_post_email')
    @mock.patch('urllib3.PoolManager')
    def test_create_text_post(self, urllib_mock, new_post_mock):
        urllib_mock = self._get_response(urllib_mock, 'text/html')
        url = reverse('post-list')
        data = {'category': self.category.id, 'title': 'test post'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual('text', response.data['type'])
        self.assertEqual(self.crowd.id, response.data['crowd']['id'])
        self.assertEqual(self.user.id, response.data['user']['id'])

        # Ensure we can get the post back
        get_response = self.client.get(
            '{}{}/'.format(url, response.data['id']))

        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.crowd.id, get_response.data['crowd']['id'])
        self.assertEqual(self.user.id, get_response.data['user']['id'])

    @mock.patch('website.models.Post._new_post_email')
    @mock.patch('urllib3.PoolManager')
    def test_create_url_post(self, urllib_mock, new_post_mock):
        urllib_mock = self._get_response(urllib_mock, 'text/html')
        url = reverse('post-list')
        data = {'category': self.category.id, 'title': 'test post',
                'url': 'http://google.com/'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual('link', response.data['type'])
        self.assertEqual('http://google.com/', response.data['url'])
