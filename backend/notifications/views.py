from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification
from .serializers import NotificationSerializer
class NotificationList(generics.ListAPIView):
 permission_classes=[IsAuthenticated];serializer_class=NotificationSerializer
 def get_queryset(self): return Notification.objects.filter(user=self.request.user).order_by("-created_at", "-pk")
class ReadNotification(APIView):
 permission_classes=[IsAuthenticated]
 def patch(self,request,pk): Notification.objects.filter(pk=pk,user=request.user).update(is_read=True);return Response(status=204)
class ReadAll(APIView):
 permission_classes=[IsAuthenticated]
 def patch(self,request): Notification.objects.filter(user=request.user,is_read=False).update(is_read=True);return Response(status=204)
