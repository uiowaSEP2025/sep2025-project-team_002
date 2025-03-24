# tokens.py
from django.contrib.auth.tokens import PasswordResetTokenGenerator

class SchoolEmailVerificationTokenGenerator(PasswordResetTokenGenerator):
    pass

school_email_token_generator = SchoolEmailVerificationTokenGenerator()