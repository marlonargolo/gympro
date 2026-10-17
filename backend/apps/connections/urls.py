from django.urls import path
from .views import (
    CreateConnectionRequestView,
    ListConnectionRequestsView,
    RespondConnectionRequestView,
    UnlinkView,
    student_ficha,
)

urlpatterns = [
    path('', ListConnectionRequestsView.as_view(), name='connection-list'),
    path('request/', CreateConnectionRequestView.as_view(), name='connection-request'),
    path('<int:pk>/<str:action>/', RespondConnectionRequestView.as_view(), name='connection-respond'),
    path('unlink/<int:student_id>/<str:connection_type>/', UnlinkView.as_view(), name='connection-unlink'),
    path('ficha/<int:student_id>/', student_ficha, name='student-ficha'),
]
