from rest_framework import routers
from poll.api import PollViewSet, SubmissionViewSet, VoteViewSet

router = routers.SimpleRouter()
router.register(r'polls/polls', PollViewSet)
router.register(r'polls/submissions', SubmissionViewSet)
router.register(r'polls/votes', VoteViewSet, base_name='votes')
