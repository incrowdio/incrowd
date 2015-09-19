from __future__ import unicode_literals
import re

from django.db import models
from rest_framework import serializers

from plugins.fantasy import standings

TEAM_URL = 'http://games.espn.go.com/ffl/clubhouse?leagueId={league}' \
           '&teamId={team}&seasonId={season}'
STANDINGS_URL = 'http://games.espn.go.com/ffl/standings?leagueId={league}' \
                '&seasonId={season}'


# Create your models here.
class FantasyProfile(models.Model):
    user = models.ForeignKey('website.UserProfile')
    owner_name = models.CharField(max_length=255, blank=True, null=True,
                                  default=None)
    league_id = models.CharField(max_length=32)
    team_id = models.IntegerField(blank=True, null=True)
    season_id = models.IntegerField()
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    ties = models.IntegerField(default=0)
    games_behind = models.IntegerField(default=0)
    points_for = models.IntegerField(default=0)
    points_against = models.IntegerField(default=0)
    home_record = models.CharField(default='', max_length=16)
    away_record = models.CharField(default='', max_length=16)
    division_record = models.CharField(default='', max_length=16)
    streak = models.CharField(default='', max_length=16)
    percentage = models.FloatField(default=0.0)
    crowd = models.ForeignKey('website.Crowd')

    @classmethod
    def from_url(cls, user, url, team_name):
        # Url should be the URL of the standings page
        c = cls()
        c.user = user
        c.crowd = user.crowd

        results = re.search(r'http://games\.espn\.go\.com\/ffl\/standings\?'
                            r'leagueId=(?P<league_id>\d+)&seasonId='
                            r'(?P<season_id>\d+)',
                            url)
        if not results:
            raise ValueError('Incorrect URL')
        print results.groups()
        all_standings = standings.scrape(results.group('league_id'),
                                         results.groups()[1])

        user_standings = None
        for standing in all_standings:
            if standing['name'] == team_name:
                user_standings = standing

        if user_standings is None:
            raise ValueError('Could find team matching {}'.format(team_name))

        for key in user_standings:
            # Dashes should be a 0 for int field
            if user_standings[key] == '--':
                user_standings[key] = 0
            setattr(c, key, user_standings[key])

        c.league_id = results.group('league_id')
        c.season_id = results.group('season_id')
        c.team_id = 1
        c.save()


class FantasyProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FantasyProfile
        fields = ('id', 'user', 'league_id', 'team_id', 'wins', 'losses',
                  'ties', 'crowd')
