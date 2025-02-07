from django.db import models

class Schools(models.Model):
  school_id = models.CharField(max_length=255)
  school_name = models.CharField(max_length=255)
  mbb = models.BooleanField(default=False)
  wbb = models.BooleanField(default=False)
  fb = models.BooleanField(default=False)
  conference = models.CharField(max_length=255)
  location = models.CharField(max_length=255)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self):
    return self.name
  
class Users(models.Model):
  first_name = models.CharField(max_length=255)
  last_name = models.CharField(max_length=255)
  email = models.CharField(max_length=255)
  password = models.CharField(max_length=255)
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

class Reviews(models.Model):
    review_id = models.CharField(max_length=255)
    school = models.ForeignKey(Schools, on_delete=models.CASCADE)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    sport = models.CharField(max_length=255)
    review_message = models.TextField()
    head_coach = models.IntegerField()
    assistant_coaches = models.IntegerField()
    team_culture = models.IntegerField()
    campus_life = models.IntegerField()
    athletic_facilities = models.IntegerField()
    athletic_department = models.IntegerField()
    player_development = models.IntegerField()
    nil_opportunity = models.IntegerField()
    date_of_review = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.review
