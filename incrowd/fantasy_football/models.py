from __future__ import unicode_literals
import re

from django.db import models
# from fantasy import lineup, standings, team

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
    team_id = models.IntegerField()
    season_id = models.IntegerField()
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    ties = models.IntegerField(default=0)
    games_behind = models.IntegerField(default=0)
    points_for = models.IntegerField(default=0)
    points_against = models.IntegerField(default=0)
    home_record = models.IntegerField(default=0)
    away_record = models.IntegerField(default=0)
    division_record = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)
    percentage = models.FloatField(default=0.0)

    def save(self, *args, **kwargs):
        # players = lineup.scrape(TEAM_URL.format(
        #     {'league': self.league_id,
        #      'team': self.team_id,
        #      'season': self.season_id}))
        # standing = lineup.scrape(STANDINGS_URL.format(
        #     {'league': self.league_id,
        #      'season': self.season_id}))
        # team_data = team.scrape(TEAM_URL.format(
        #     {'league': self.league_id,
        #      'team': self.team_id,
        #      'season': self.season_id}))
        pass

    @classmethod
    def from_url(cls, user, url):
        results = re.search(r'http://games\.espn\.go\.com\/ffl\/clubhouse\?'
                            r'leagueId=(?P<league_id>\d+)&teamId='
                            r'(?P<team_id>\d+)&seasonId=(?P<season_id>\d+)',
                            url)
        if not results:
            raise ValueError('Incorrect URL')
        c = cls()
        c.user = user
        c.league_id = results.group('league_id')
        c.team_id = results.group('team_id')
        c.season_id = results.group('season_id')
