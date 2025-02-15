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
def test_signup_creation_with_invalid_data(live_server):
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

    response1 = requests.post(url, json=data)
    assert response1.status_code == 201

    response2 = requests.post(url, json=data)
    assert response2.status_code == 400
