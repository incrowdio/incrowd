from django.core.urlresolvers import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token

from website.models import UserProfile, Category


class PostTests(APITestCase):
    def setUp(self):
        self.user = UserProfile(username='test', email='test@example.com',
                                password='password')
        self.user.save()

        # Include an appropriate `Authorization:` header on all requests.
        self.token = Token(user=self.user)
        self.token.save()

        self.category = Category(created_by=self.user, name='test_category',
                                 color='red')
        self.category.save()

        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)

    def test_create_text_post(self):
        url = reverse('post-list')
        data = {'category': [self.category.id], 'title': ['test post']}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_url_post(self):
        url = reverse('post-list')
        data = {'category': [self.category.id], 'title': ['test post'],
                'url': ['http://google.com/']}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
