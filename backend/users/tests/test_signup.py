# This will be the backend testing file for Signup
# Looking to test:
# Duplicates, Regular, Email unique, wrong verify password

import pytest
import requests


@pytest.mark.django_db
def test_signup_creation(live_server):
    url = f"{live_server.url}/users/signup/"
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "password": "Password123",
        "verifyPassword": "Password123",
        "transferType": "transfer_in",
    }
    response = requests.post(url, json=data)
    print(response.json())

    # Expecting 201 for a successful creation
    assert response.status_code == 201
    json_response = response.json()
    # Check for a key that exists in your response (e.g., 'id')
    assert "id" in json_response
    # You can also check that the email is as expected
    assert json_response["email"] == "john@example.com"


@pytest.mark.django_db
def test_signup_invalid_password(live_server):
    url = f"{live_server.url}/users/signup/"
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "password": "pass",
        "verifyPassword": "pass",
        "transferType": "transfer_in",
    }
    response = requests.post(url, json=data)
    print(response.json())

    json_response = response.json()
    assert "error" in json_response
    assert "Password is not strong enough" in json_response["error"]


@pytest.mark.django_db
def test_signup_duplicate(live_server):
    url = f"{live_server.url}/users/signup/"
    data = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "password": "Password123",
        "verifyPassword": "Password123",
        "transferType": "transfer_in",
    }

    # First signup attempt
    response1 = requests.post(url, json=data)
    assert response1.status_code == 201

    # Second signup attempt
    response2 = requests.post(url, json=data)
    assert response2.status_code == 400


@pytest.mark.django_db
def test_signup_invalid_email(live_server):
    url = f"{live_server.url}/users/signup/"

    errormsg = "Invalid email format."

    invalid_emails = [
        ("johnexample.com", errormsg),
        ("john@example", errormsg),
        ("@example", errormsg),
        ("@example.com", errormsg),
        ("john.com", errormsg),
    ]

    for email, expectedError in invalid_emails:
        invalid_email_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": email,
            "password": "Password123",
            "verifyPassword": "Password123",
            "transferType": "transfer_in",
        }

        response = requests.post(url, json=invalid_email_data)

        assert response.status_code == 400
        assert expectedError in response.json().get("error")


@pytest.mark.django_db
def test_signup_missing_data(live_server):
    url = f"{live_server.url}/users/signup/"

    required_fields = [
        ("first_name", "first_name is required."),
        ("last_name", "last_name is required."),
        ("email", "email is required."),
        ("password", "password is required."),
        # ("verifyPassword", "password confirmation is required."), #Currently, this won't work
    ]

    for field, expectedError in required_fields:
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "password": "Password123",
            "verifyPassword": "Password123",
            "transferType": "transfer_in",
        }
        data.pop(field)

        response = requests.post(url, json=data)

        assert response.status_code == 400
        assert expectedError in response.json().get("error")


# # Currently, there's no backend way of checking to make sure
# # the passwords match
# @pytest.mark.django_db
# def test_signup_mismatched_passwords(live_server):
#     url = f"{live_server.url}/users/signup/"
#     data = {
#         "first_name": "John",
#         "last_name": "Doe",
#         "email": "john@example.com",
#         "password": "Password123",
#         "verifyPassword": "123Password",
#         "transferType": "transfer_in",
#     }
#
#     response = requests.post(url, json=data)
#     json_repsonse = response.json()
#     print(response.json())
#
#     assert response.status_code == 400
