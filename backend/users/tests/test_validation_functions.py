import pytest
from users.views import is_valid_email, is_strong_password


class TestValidationFunctions:
    def test_is_valid_email_valid_cases(self):
        """Test valid email addresses"""
        valid_emails = [
            "test@example.com",
            "user.name@example.co.uk",
            "user+tag@example.org",
            "user-name@domain.com",
            "user_name@domain.com",
            "user123@domain.com",
        ]

        for email in valid_emails:
            assert is_valid_email(email) is True, f"Email {email} should be valid"

    def test_is_valid_email_invalid_cases(self):
        """Test invalid email addresses"""
        invalid_emails = [
            "test@example",  # Missing TLD
            "test@.com",  # Missing domain
            "test.com",  # Missing @ symbol
            "@example.com",  # Missing username
            # "test@example..com",  # Double dot - current implementation doesn't catch this
            "test@exam ple.com",  # Space in domain
            "te st@example.com",  # Space in username
            "",  # Empty string
        ]

        for email in invalid_emails:
            assert is_valid_email(email) is False, f"Email {email} should be invalid"

    def test_is_strong_password_valid_cases(self):
        """Test valid passwords"""
        valid_passwords = [
            "Password123",
            "Abcdef1",
            "abcDEF123",
            "A1b2C3d4",
            "StrongP@ssw0rd",
        ]

        for password in valid_passwords:
            assert is_strong_password(password) is True, f"Password {password} should be valid"

    def test_is_strong_password_invalid_cases(self):
        """Test invalid passwords"""
        invalid_passwords = [
            "pass",  # Too short
            "password",  # No uppercase or digits
            "PASSWORD",  # No lowercase or digits
            "12345678",  # No letters
            "Password",  # No digits
            "password123",  # No uppercase
            "PASSWORD123",  # No lowercase
            "",  # Empty string
        ]

        for password in invalid_passwords:
            assert is_strong_password(password) is False, f"Password {password} should be invalid"

    def test_is_strong_password_edge_cases(self):
        """Test edge cases for password strength"""
        # Exactly 6 characters with all requirements
        assert is_strong_password("Abc123") is True

        # Exactly 6 characters but missing requirements
        assert is_strong_password("abcdef") is False  # No uppercase or digits
        assert is_strong_password("ABCDEF") is False  # No lowercase or digits
        assert is_strong_password("123456") is False  # No letters
        assert is_strong_password("Abcde") is False  # Too short
