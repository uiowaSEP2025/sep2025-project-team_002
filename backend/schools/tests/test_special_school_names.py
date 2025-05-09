import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from schools.models import Schools


@pytest.mark.django_db
class TestSpecialSchoolNames:
    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def create_school(self):
        def _create_school(name, mbb=False, wbb=False, fb=False):
            return Schools.objects.create(
                school_name=name,
                mbb=mbb,
                wbb=wbb,
                fb=fb,
                conference="Test Conference",
                location="Test Location",
            )

        return _create_school

    def test_school_with_hyphen(self, api_client, create_school):
        """Test handling of school names with hyphens"""
        # Create a school with a hyphenated name
        school = create_school("Wisconsin-Madison", fb=True)

        # Test exact match
        url = reverse("filter-schools")
        response = api_client.get(url + "?school_name=Wisconsin-Madison")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "Wisconsin-Madison" in returned_school_names

        # Test partial match with hyphen
        response = api_client.get(url + "?school_name=Wisconsin")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "Wisconsin-Madison" in returned_school_names

    def test_multiple_hyphenated_schools(self, api_client, create_school):
        """Test handling multiple schools with hyphens in their names"""
        schools = [
            create_school("Wisconsin-Madison", fb=True),
            create_school("North Carolina-Chapel Hill", fb=True),
            create_school("Texas A&M", fb=True),
        ]

        url = reverse("filter-schools")

        # Test filtering with partial hyphenated name
        response = api_client.get(url + "?school_name=Wisconsin")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "Wisconsin-Madison" in returned_school_names
        assert "North Carolina-Chapel Hill" not in returned_school_names

        # Test filtering with full hyphenated name
        response = api_client.get(url + "?school_name=North Carolina-Chapel Hill")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "North Carolina-Chapel Hill" in returned_school_names
        assert "Wisconsin-Madison" not in returned_school_names

    def test_case_insensitive_hyphenated_names(self, api_client, create_school):
        """Test case insensitivity with hyphenated school names"""
        school = create_school("Wisconsin-Madison", fb=True)

        url = reverse("filter-schools")

        # Test with lowercase
        response = api_client.get(url + "?school_name=wisconsin-madison")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "Wisconsin-Madison" in returned_school_names

        # Test with uppercase
        response = api_client.get(url + "?school_name=WISCONSIN-MADISON")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "Wisconsin-Madison" in returned_school_names

        # Test with mixed case
        response = api_client.get(url + "?school_name=Wisconsin-MADISON")
        assert response.status_code == status.HTTP_200_OK
        returned_school_names = [school["school_name"] for school in response.data]
        assert "Wisconsin-Madison" in returned_school_names
