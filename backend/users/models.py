from django.db import models
from django.utils import timezone
from schools.models import Schools
  
class Users(models.Model):
  first_name = models.CharField(max_length=255)
  last_name = models.CharField(max_length=255)
  email = models.CharField(max_length=255)
  password = models.CharField(max_length=255)
  role = models.CharField(max_length=255, default='user')
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)
  transfer_out_school = models.ForeignKey(
    Schools, 
    on_delete=models.CASCADE, 
    null=True, 
    blank=True,
    related_name='transfer_out_school'
  )
  transfer_in_school = models.ForeignKey(
    Schools, 
    on_delete=models.CASCADE, 
    null=True, 
    blank=True,
    related_name='transfer_in_school'
  )
  session_token = models.CharField(max_length=255, null=True, blank=True)

  def __str__(self):
    return self.first_name