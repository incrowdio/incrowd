from rest_framework import routers
from poll.api import PollViewSet, SubmissionViewSet, VoteViewSet

router = routers.SimpleRouter()
router.register(r'submissions', SubmissionViewSet)
router.register(r'votes', VoteViewSet, base_name='votes')
router.register(r'polls', PollViewSet)
