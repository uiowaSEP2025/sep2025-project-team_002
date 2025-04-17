import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from schools.models import Schools


@pytest.mark.django_db
class TestGetSchools:
    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def create_schools(self):
        def _create_schools(count=3):
            schools = []
            for i in range(count):
                school = Schools.objects.create(
                    school_name=f"Test School {i+1}",
                    conference=f"Test Conference {i+1}",
                    location=f"Test Location {i+1}",
                    mbb=True,
                    wbb=True,
                    fb=True
                )
                schools.append(school)
            return schools
        return _create_schools

    def test_get_schools_success(self, api_client, create_schools):
        """Test successfully retrieving all schools"""
        # Create test schools
        schools = create_schools(3)

        url = reverse("get_schools")
        response = api_client.get(url)

        # Assert the response is correct
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 3  # At least our 3 test schools

        # Check that our test schools are in the response
        school_names = [school["school_name"] for school in response.data]
        for school in schools:
            assert school.school_name in school_names

    def test_get_schools_empty(self, api_client):
        """Test retrieving schools when there are none"""
        # Delete all existing schools
        Schools.objects.all().delete()

        url = reverse("get_schools")
        response = api_client.get(url)

        # Assert the response is correct
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0  # No schools
