import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestReportIssue:
    def test_report_issue_success(self, api_client):
        """Test successful issue reporting"""
        url = reverse("report_issue")
        data = {
            "email": "test@example.com",
            "name": "Test User",
            "description": "This is a test issue report",
        }

        # Mock the send_mail function to avoid actually sending emails during tests
        with patch("report.views.send_mail") as mock_send_mail:
            response = api_client.post(url, data, format="json")

            # Assert the response is correct
            assert response.status_code == status.HTTP_201_CREATED
            assert response.data["message"] == "Issue reported successfully."

            # Assert send_mail was called with the right parameters
            mock_send_mail.assert_called_once()
            args, kwargs = mock_send_mail.call_args
            assert args[0] == "New Issue Reported"  # subject
            assert "test@example.com" in args[1]  # message contains email
            assert "Test User" in args[1]  # message contains name
            assert (
                "This is a test issue report" in args[1]
            )  # message contains description

    def test_report_issue_missing_email(self, api_client):
        """Test issue reporting with missing email"""
        url = reverse("report_issue")
        data = {"name": "Test User", "description": "This is a test issue report"}

        response = api_client.post(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email and description are required" in response.data["error"]

    def test_report_issue_missing_description(self, api_client):
        """Test issue reporting with missing description"""
        url = reverse("report_issue")
        data = {"email": "test@example.com", "name": "Test User"}

        response = api_client.post(url, data, format="json")

        # Assert the response indicates a bad request
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email and description are required" in response.data["error"]

    def test_report_issue_email_failure(self, api_client):
        """Test handling of email sending failure"""
        url = reverse("report_issue")
        data = {
            "email": "test@example.com",
            "name": "Test User",
            "description": "This is a test issue report",
        }

        # Mock send_mail to raise an exception
        with patch("report.views.send_mail") as mock_send_mail:
            mock_send_mail.side_effect = Exception("Email sending failed")
            response = api_client.post(url, data, format="json")

            # Assert the response indicates a server error
            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            assert "Email sending failed" in response.data["error"]
