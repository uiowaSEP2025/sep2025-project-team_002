from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Schools
from .serializers import SchoolSerializer
from reviews.models import Reviews
from openai import OpenAI
from django.conf import settings
import logging
from django.db import models
from preferences.models import Preferences
from django.shortcuts import get_object_or_404
import openai
import os
from datetime import datetime
from reviews.services import CoachSearchService

logger = logging.getLogger(__name__)


@api_view(["GET"])
def get_schools(request):
    schools = Schools.objects.all()
    serializer = SchoolSerializer(schools, many=True, context={"request": request})
    return Response(serializer.data)


# Public views
class SchoolListView(generics.ListAPIView):
    queryset = Schools.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [AllowAny]


class SchoolDetailView(generics.RetrieveAPIView):
    queryset = Schools.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [AllowAny]


# Protected views
class ProtectedSchoolListView(generics.ListCreateAPIView):
    queryset = Schools.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]


class ProtectedSchoolDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Schools.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]


def _normalize_coach_name(name):
    """Normalize coach name by converting to lowercase and stripping whitespace."""
    return name.lower().strip()


def _standardize_coach_name(name):
    """Standardize coach name capitalization (e.g., 'jan JENSEN' -> 'Jan Jensen')."""
    # Split into words and capitalize each word
    words = name.split()
    standardized = " ".join(word.capitalize() for word in words)
    return standardized


def _normalize_school_name(name):
    if not name:
        return [""]
    # Replace en-dash and em-dash with hyphen for school names
    name = name.lower().strip().replace("–", "-").replace("—", "-")
    return [name]


@api_view(["GET"])
@permission_classes([AllowAny])
def get_review_summary(request, school_id):
    try:
        # Get sport parameter and validate
        sport = request.GET.get("sport")
        if not sport:
            return Response(
                {"error": "Sport parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get school or return 404
        school = get_object_or_404(Schools, id=school_id)

        # Convert sport code to full name if needed
        code_to_display = {
            "mbb": "Men's Basketball",
            "wbb": "Women's Basketball",
            "fb": "Football",
        }

        # Use the full sport name for display
        display_sport = code_to_display.get(sport, sport)

        # Get all reviews for this school and sport
        reviews = Reviews.objects.filter(school=school, sport=sport).order_by(
            "-created_at"
        )

        if not reviews.exists():
            return Response(
                {
                    "summary": f"No reviews available for {display_sport} at {school.school_name} yet."
                },
                status=status.HTTP_200_OK,
            )

        # Get the most recent review's coach
        latest_review = reviews.first()
        latest_coach = latest_review.head_coach_name
        latest_review_date = latest_review.created_at.isoformat()

        # Ensure we have dictionaries for our JSON fields
        if not isinstance(school.sport_summaries, dict):
            school.sport_summaries = {}
        if not isinstance(school.sport_review_dates, dict):
            school.sport_review_dates = {}

        # Initialize sport-specific dictionaries if they don't exist
        if sport not in school.sport_summaries:
            school.sport_summaries[sport] = {}
        if sport not in school.sport_review_dates:
            school.sport_review_dates[sport] = {}

        # Ensure the sport-specific entries are dictionaries
        if not isinstance(school.sport_summaries[sport], dict):
            school.sport_summaries[sport] = {}
        if not isinstance(school.sport_review_dates[sport], dict):
            school.sport_review_dates[sport] = {}

        # Group reviews by normalized coach name
        coach_reviews = {}
        for review in reviews:
            coach_name = review.head_coach_name
            normalized_name = _normalize_coach_name(coach_name)
            if normalized_name not in coach_reviews:
                # Use standardized capitalization for the original name
                coach_reviews[normalized_name] = {
                    "original_name": _standardize_coach_name(coach_name),
                    "reviews": [],
                }
            coach_reviews[normalized_name]["reviews"].append(review)

        # Initialize OpenAI client and CoachSearchService
        client = OpenAI()
        coach_service = CoachSearchService()

        # List to store all summaries for final output
        coach_summaries = []

        # First, handle the latest reviewed coach
        latest_coach_normalized = _normalize_coach_name(latest_coach)
        stored_date = school.sport_review_dates[sport].get(latest_coach)
        needs_update = latest_coach not in school.sport_summaries[
            sport
        ] or (  # No summary exists
            stored_date and stored_date < latest_review_date
        )  # Summary is outdated

        # Get all reviews text for general aspects (facilities, NIL, etc.)
        all_reviews_text = " ".join(
            [
                " ".join(
                    [
                        f"Athletic Facilities: {review.review_message if 'facilities' in review.review_message.lower() else ''}",
                        f"NIL Opportunities: {review.review_message if 'nil' in review.review_message.lower() else ''}",
                        f"Campus Life: {review.review_message if 'campus' in review.review_message.lower() else ''}",
                        f"Athletic Department: {review.review_message if 'department' in review.review_message.lower() or 'athletic department' in review.review_message.lower() else ''}",
                        f"Team Culture: {review.review_message if 'culture' in review.review_message.lower() or 'team culture' in review.review_message.lower() else ''}",
                    ]
                )
                for review in reviews
            ]
        )

        # Generate general summary
        try:
            general_response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": f"You are a helpful assistant that summarizes general aspects of {display_sport} programs (excluding coach-specific information). Focus on athletic facilities, NIL opportunities, campus life, athletic department support, and team culture. Provide a concise 2-3 sentence summary that captures the overall sentiment about these aspects from the reviews.",
                    },
                    {"role": "user", "content": all_reviews_text},
                ],
                max_tokens=250,
                temperature=0.7,
                presence_penalty=0.6,
                frequency_penalty=0.6,
            )
            general_summary = general_response.choices[0].message.content

            # Store the general summary
            if not isinstance(school.sport_summaries[sport], dict):
                school.sport_summaries[sport] = {}
            school.sport_summaries[sport]["general_summary"] = general_summary
            school.save()
        except Exception as e:
            logger.error(f"Error generating general summary: {str(e)}")
            general_summary = school.sport_summaries[sport].get("general_summary", "")

        if needs_update:
            try:
                # Get coach history
                history, error = coach_service.search_coach_history(
                    latest_coach, school.school_name, sport
                )
                logger.info(
                    f"Generating new summary for {latest_coach} due to new review"
                )

                # Prepare reviews text - only coach-specific aspects
                reviews_text = " ".join(
                    [
                        " ".join(
                            [
                                f"Head Coach Performance: {review.review_message if latest_coach.lower() in review.review_message.lower() else ''}",
                                f"Coaching Style: {review.review_message if 'coach' in review.review_message.lower() or 'coaching' in review.review_message.lower() else ''}",
                                f"Player Development: {review.review_message if 'development' in review.review_message.lower() or 'player development' in review.review_message.lower() else ''}",
                            ]
                        )
                        for review in coach_reviews[latest_coach_normalized]["reviews"]
                    ]
                )

                # Generate summary using OpenAI
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system",
                            "content": f"You are a helpful assistant that summarizes {display_sport} program reviews for {coach_reviews[latest_coach_normalized]['original_name']}. Provide a concise summary in exactly 2 sentences, focusing on coaching style, player development, and overall coaching performance. Always talk about it from a reviews perspective, like 'reviewers state...' or 'according to reviews...', and always refer to the coach by their actual name ('{coach_reviews[latest_coach_normalized]['original_name']}'). Focus only on coach-specific aspects.",
                        },
                        {"role": "user", "content": reviews_text},
                    ],
                    max_tokens=250,
                    temperature=0.7,
                    presence_penalty=0.6,
                    frequency_penalty=0.6,
                )

                summary = response.choices[0].message.content

                # Format the coach summary
                coach_summary_parts = [
                    f"**{coach_reviews[latest_coach_normalized]['original_name']}**:"
                ]

                if history and history != "No tenure found":
                    coach_summary_parts.extend(["Tenure:", history])

                    # Only check if coach is no longer at school for basketball coaches
                    if sport in [
                        "Men's Basketball",
                        "Women's Basketball",
                        "mbb",
                        "wbb",
                    ]:
                        tenure_entries = history.split("\n")
                        if tenure_entries:
                            most_recent_tenure = tenure_entries[-1].lower()
                            # Add special case mapping for Nebraska
                            special_case_school_names = {
                                "university of central florida": ["ucf", "university of central florida", "central florida"],#works
                                "central florida": ["ucf", "university of central florida", "central florida"],#works
                                "university of colorado boulder": ["colorado", "university of colorado boulder"], #works
                                
                                "university of texas at austin": ["texas", "university of texas at austin"], #works
\

                                # Illinois
                                "university of illinois at urbana–champaign": ["illinois", "university of illinois at urbana–champaign", "university of illinois at urbana-champaign"],
                                "university of illinois at urbana-champaign": ["illinois", "university of illinois at urbana–champaign", "university of illinois at urbana-champaign"],
                                "illinois": ["illinois", "university of illinois at urbana–champaign", "university of illinois at urbana-champaign"],
                                "illinois at urbana-champaign": ["illinois", "university of illinois at urbana–champaign", "university of illinois at urbana-champaign"],

                                # Maryland
                                "university of maryland, college park": ["maryland", "university of maryland, college park"],
                                "maryland": ["maryland", "university of maryland, college park"],
                                
                                # Nebraska
                                "university of nebraska–lincoln": ["nebraska", "university of nebraska–lincoln", "university of nebraska-lincoln"],
                                "university of nebraska-lincoln": ["nebraska", "university of nebraska–lincoln", "university of nebraska-lincoln"],
                                "nebraska": ["nebraska", "university of nebraska–lincoln", "university of nebraska-lincoln"],
                                "nebraska-lincoln": ["nebraska", "university of nebraska–lincoln", "university of nebraska-lincoln"],

                                # Wisconsin
                                "university of wisconsin–madison": ["wisconsin", "university of wisconsin–madison", "university of wisconsin-madison"],
                                "university of wisconsin-madison": ["wisconsin", "university of wisconsin–madison", "university of wisconsin-madison"],
                                "wisconsin": ["wisconsin", "university of wisconsin–madison", "university of wisconsin-madison"],
                                "wisconsin-madison": ["wisconsin", "university of wisconsin–madison", "university of wisconsin-madison"],
                            }

                            normalized_school_names = _normalize_school_name(school.school_name)
                            school_key = normalized_school_names[0]  # usually just one

                            logger.info(f"DEBUG: Normalized school name: '{school_key}'")
                            logger.info(f"DEBUG: Special case mapping keys: {list(special_case_school_names.keys())}")

                            if school_key in special_case_school_names:
                                logger.info(f"DEBUG: Matched special case for '{school_key}' -> {special_case_school_names[school_key]}")
                                normalized_school_names = special_case_school_names[school_key]
                            else:
                                logger.info(f"DEBUG: No special case match for '{school_key}'")

                            # Now do the check as before
                            is_at_school = any(
                                most_recent_tenure.endswith(f"@{name}")
                                for name in normalized_school_names
                            )
                            logger.info(f"DEBUG: most_recent_tenure: '{most_recent_tenure}', normalized_school_names: {normalized_school_names}, is_at_school: {is_at_school}")
                            if not is_at_school:
                                coach_summary_parts.append("*No longer at this school*")
                else:
                    # Only show no tenure message for basketball coaches
                    if sport in [
                        "Men's Basketball",
                        "Women's Basketball",
                        "mbb",
                        "wbb",
                    ]:
                        coach_summary_parts.append("*No longer at this school*")

                coach_summary_parts.append(summary)
                coach_summary = "\n".join(coach_summary_parts)

                # Store the new summary and date
                school.sport_summaries[sport][
                    coach_reviews[latest_coach_normalized]["original_name"]
                ] = coach_summary
                school.sport_review_dates[sport][
                    coach_reviews[latest_coach_normalized]["original_name"]
                ] = latest_review_date
                school.save()

                coach_summaries.append(coach_summary)

            except Exception as e:
                logger.error(f"Error generating summary for {latest_coach}: {str(e)}")
                # Use existing summary if available
                if (
                    coach_reviews[latest_coach_normalized]["original_name"]
                    in school.sport_summaries[sport]
                ):
                    coach_summaries.append(
                        school.sport_summaries[sport][
                            coach_reviews[latest_coach_normalized]["original_name"]
                        ]
                    )
                else:
                    # Create basic fallback summary
                    coach_summary_parts = [
                        f"**{coach_reviews[latest_coach_normalized]['original_name']}**:"
                    ]
                    if history and history != "No tenure found":
                        coach_summary_parts.extend(["Tenure:", history])
                        # Only check if coach is no longer at school for basketball coaches
                        if sport in [
                            "Men's Basketball",
                            "Women's Basketball",
                            "mbb",
                            "wbb",
                        ]:
                            if tenure_entries:
                                most_recent_tenure = tenure_entries[-1].lower()
                                # Add special case mapping for Nebraska
                                special_case_school_names = {
                                    "university of central florida": ["ucf", "university of central florida", "central florida"],#works
                                    "central florida": ["ucf", "university of central florida", "central florida"],#works
                                    "university of colorado boulder": ["colorado", "university of colorado boulder"], #works
                                    
                                    "university of texas at austin": ["texas", "university of texas at austin"], #works
\

                                    # Illinois
                                    "university of illinois at urbana–champaign": ["illinois", "university of illinois at urbana–champaign", "university of illinois at urbana-champaign"],
                                    "university of illinois at urbana-champaign": ["illinois", "university of illinois at urbana–champaign", "university of illinois at urbana-champaign"],
                                    "illinois": ["illinois", "university of illinois at urbana–champaign", "university of illinois at urbana-champaign"],

                                    # Maryland
                                    "university of maryland, college park": ["maryland", "university of maryland, college park"],
                                    "maryland": ["maryland", "university of maryland, college park"],

                                    # Nebraska
                                    "university of nebraska–lincoln": ["nebraska", "university of nebraska–lincoln", "university of nebraska-lincoln"],
                                    "university of nebraska-lincoln": ["nebraska", "university of nebraska–lincoln", "university of nebraska-lincoln"],
                                    "nebraska": ["nebraska", "university of nebraska–lincoln", "university of nebraska-lincoln"],

                                    # Wisconsin
                                    "university of wisconsin–madison": ["wisconsin", "university of wisconsin–madison", "university of wisconsin-madison"],
                                    "university of wisconsin-madison": ["wisconsin", "university of wisconsin–madison", "university of wisconsin-madison"],
                                    "wisconsin": ["wisconsin", "university of wisconsin–madison", "university of wisconsin-madison"],

                                    # ...add more as needed
                                }

                                normalized_school_names = _normalize_school_name(school.school_name)
                                school_key = normalized_school_names[0]  # usually just one

                                if school_key in special_case_school_names:
                                    normalized_school_names = special_case_school_names[school_key]

                                # Now do the check as before
                                is_at_school = any(
                                    most_recent_tenure.endswith(f"@{name}")
                                    for name in normalized_school_names
                                )
                                if not is_at_school:
                                    coach_summary_parts.append(
                                        "*No longer at this school*"
                                    )
                    else:
                        # Only show no tenure message for basketball coaches
                        if sport in [
                            "Men's Basketball",
                            "Women's Basketball",
                            "mbb",
                            "wbb",
                        ]:
                            coach_summary_parts.append("*No longer at this school*")

                    reviews_text = "\n".join(
                        [
                            f"Review from {review.created_at.strftime('%Y-%m-%d')}: {review.review_message}"
                            for review in coach_reviews[latest_coach_normalized][
                                "reviews"
                            ]
                        ]
                    )
                    coach_summary_parts.append(reviews_text)
                    coach_summary = "\n".join(coach_summary_parts)

                    # Store the fallback summary
                    school.sport_summaries[sport][
                        coach_reviews[latest_coach_normalized]["original_name"]
                    ] = coach_summary
                    school.sport_review_dates[sport][
                        coach_reviews[latest_coach_normalized]["original_name"]
                    ] = latest_review_date
                    school.save()

                    coach_summaries.append(coach_summary)
        else:
            # Use existing summary for the latest coach
            coach_summaries.append(
                school.sport_summaries[sport][
                    coach_reviews[latest_coach_normalized]["original_name"]
                ]
            )

        # For other coaches, ONLY use existing summaries from the database
        for normalized_name, coach_data in coach_reviews.items():
            if normalized_name != latest_coach_normalized:
                original_name = coach_data["original_name"]
                if original_name in school.sport_summaries[sport]:
                    # Only append existing summaries, never generate new ones
                    coach_summaries.append(school.sport_summaries[sport][original_name])

        # Add the general summary at the end
        final_parts = coach_summaries + ["**Program Overview**:", general_summary]

        # Combine all summaries with double newlines
        final_summary = "\n\n".join(final_parts)
        return Response({"summary": final_summary})

    except Exception as e:
        logger.error(f"Error in get_review_summary: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# New endpoint for filtering schools based on reviews and ratings
@api_view(["GET"])
@permission_classes([AllowAny])
def filter_schools(request):
    school_name = request.query_params.get("school_name", "")
    coach = request.query_params.get("coach", "")
    sport = request.query_params.get("sport", "")

    # Prepare rating filters
    rating_fields = [
        "head_coach",
        "assistant_coaches",
        "team_culture",
        "campus_life",
        "athletic_facilities",
        "athletic_department",
        "player_development",
        "nil_opportunity",
    ]
    rating_filters = {}
    for field in rating_fields:
        val = request.query_params.get(field, "")
        if val:
            try:
                rating_filters[field] = int(val)
            except ValueError:
                pass

    display_to_code = {
        "Men's Basketball": "mbb",
        "Women's Basketball": "wbb",
        "Football": "fb",
        "Volleyball": "vb",
        "Baseball": "ba",
        "Men's Soccer": "msoc",
        "Women's Soccer": "wsoc",
        "Wrestling": "wr",
    }

    # Normalize sport for review filtering
    sport_code = display_to_code.get(sport, sport)

    # Filter reviews based on coach, sport, and rating filters
    reviews_query = Reviews.objects.all()
    if coach:
        reviews_query = reviews_query.filter(head_coach_name__icontains=coach)
    if sport:
        reviews_query = reviews_query.filter(sport=sport_code)
    for field, rating in rating_filters.items():
        # Use greater than or equal to for ratings instead of exact match
        reviews_query = reviews_query.filter(**{f"{field}__gte": rating})

    school_ids_from_reviews = reviews_query.values_list(
        "school_id", flat=True
    ).distinct()

    # Filter schools based on school name if provided
    schools_query = Schools.objects.all()
    if school_name:
        schools_query = schools_query.filter(school_name__icontains=school_name)

    # If coach or sport or ratings filters are applied, intersect with schools from reviews
    if coach or sport or rating_filters:
        schools_query = schools_query.filter(id__in=school_ids_from_reviews)

    # Additional filter for sport field at the school level
    if sport:
        if sport == "Men's Basketball":
            schools_query = schools_query.filter(mbb=True)
        elif sport == "Women's Basketball":
            schools_query = schools_query.filter(wbb=True)
        elif sport == "Football":
            schools_query = schools_query.filter(fb=True)
        elif sport == "Volleyball":
            schools_query = schools_query.filter(vb=True)
        elif sport == "Baseball":
            schools_query = schools_query.filter(ba=True)
        elif sport == "Men's Soccer":
            schools_query = schools_query.filter(msoc=True)
        elif sport == "Women's Soccer":
            schools_query = schools_query.filter(wsoc=True)
        elif sport == "Wrestling":
            schools_query = schools_query.filter(wr=True)

    serializer = SchoolSerializer(
        schools_query, many=True, context={"request": request}
    )
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_recommended_schools(request):
    try:
        current_user = request.user
        logger.info("=== RECOMMENDATIONS DEBUG START ===")
        logger.info(f"User ID: {current_user.id}")

        # Debug: Check all preferences in the system
        all_preferences = Preferences.objects.all()
        logger.info(f"\nAll preferences in system:")
        for pref in all_preferences:
            logger.info(f"User {pref.user.id} - Sport: {pref.sport}")

        # Debug: Check all reviews in the system
        all_reviews = Reviews.objects.all()
        logger.info(f"\nAll reviews in system:")
        for review in all_reviews:
            logger.info(
                f"Review by User {review.user.id} - School: {review.school.school_name}, Sport: {review.sport}"
            )

        # Debug: Check all schools and their sports
        all_schools = Schools.objects.all()
        logger.info(f"\nAll schools and their sports:")
        for school in all_schools:
            sports = []
            if school.mbb:
                sports.append("mbb")
            if school.wbb:
                sports.append("wbb")
            if school.fb:
                sports.append("fb")
            if school.vb:
                sports.append("vb")
            if school.ba:
                sports.append("ba")
            if school.msoc:
                sports.append("msoc")
            if school.wsoc:
                sports.append("wsoc")
            if school.wr:
                sports.append("wr")
            logger.info(f"School {school.school_name} - Sports: {', '.join(sports)}")

        # Get user's preferences
        user_preferences = Preferences.objects.filter(user=current_user).first()
        if not user_preferences:
            logger.info(f"No preferences found for user {current_user.id}.")
            return Response({"no_preferences": True})

        # Log user's preferences
        logger.info(f"\nUser preferences:")
        logger.info(f"Sport: {user_preferences.sport}")
        logger.info(f"Head Coach: {user_preferences.head_coach}")
        logger.info(f"Assistant Coaches: {user_preferences.assistant_coaches}")
        logger.info(f"Team Culture: {user_preferences.team_culture}")
        logger.info(f"Campus Life: {user_preferences.campus_life}")
        logger.info(f"Athletic Facilities: {user_preferences.athletic_facilities}")
        logger.info(f"Athletic Department: {user_preferences.athletic_department}")
        logger.info(f"Player Development: {user_preferences.player_development}")
        logger.info(f"NIL Opportunity: {user_preferences.nil_opportunity}")

        sport = user_preferences.sport
        logger.info(f"\nProcessing recommendations for sport: {sport}")

        # Convert display names to codes and handle both formats
        display_to_code = {
            "Men's Basketball": "mbb",
            "Women's Basketball": "wbb",
            "Football": "fb",
            "Volleyball": "vb",
            "Baseball": "ba",
            "Men's Soccer": "msoc",
            "Women's Soccer": "wsoc",
            "Wrestling": "wr",
        }
        code_to_display = {
            "mbb": "Men's Basketball",
            "wbb": "Women's Basketball",
            "fb": "Football",
            "vb": "Volleyball",
            "ba": "Baseball",
            "msoc": "Men's Soccer",
            "wsoc": "Women's Soccer",
            "wr": "Wrestling",
        }

        # Handle both cases - if it's a display name, convert to code, if it's a code, keep as is
        sport_code = display_to_code.get(sport, sport)
        if sport_code not in ["mbb", "wbb", "fb", "vb", "ba", "msoc", "wsoc", "wr"]:
            # If it's not a valid code after conversion, try reverse lookup
            for code, display in code_to_display.items():
                if sport == display:
                    sport_code = code
                    break

        logger.info(f"Converted sport '{sport}' to code '{sport_code}'")

        # Get all reviews for this sport (including current user's reviews)
        sport_reviews = Reviews.objects.filter(sport=sport_code)
        logger.info(f"\nAll reviews for sport {sport_code}:")
        for review in sport_reviews:
            logger.info(
                f"Review by User {review.user.id} for {review.school.school_name}"
            )

        if not sport_reviews.exists():
            logger.info(f"No reviews found for {sport_code}")
            return Response([])

        # Get schools that have reviews for this sport
        school_ids_with_reviews = sport_reviews.values_list(
            "school_id", flat=True
        ).distinct()
        logger.info(
            f"Found {len(school_ids_with_reviews)} schools with reviews for {sport_code}"
        )

        # Get schools that the current user has already reviewed for this sport
        user_reviewed_schools = Reviews.objects.filter(
            user=current_user, sport=sport_code
        ).values_list("school_id", flat=True)
        logger.info(
            f"User has already reviewed {len(user_reviewed_schools)} schools for {sport_code}"
        )

        # Debug: Print school IDs and names
        schools_with_reviews = Schools.objects.filter(id__in=school_ids_with_reviews)
        logger.info("Schools with reviews:")
        for school in schools_with_reviews:
            logger.info(f"- ID: {school.id}, Name: {school.school_name}")

        if not school_ids_with_reviews:
            logger.info(f"No schools have reviews for {sport_code}")
            return Response([])

        # Get all schools, excluding those the user has already reviewed
        schools = Schools.objects.filter(id__in=school_ids_with_reviews).exclude(
            id__in=user_reviewed_schools
        )
        logger.info(
            f"Total schools with reviews to check (excluding user's reviews): {schools.count()}"
        )

        recommended_schools = []

        for school in schools:
            # Check if this school offers the user's preferred sport
            has_sport = False
            if sport_code == "mbb" and school.mbb:
                has_sport = True
                logger.info(f"School {school.school_name} offers Men's Basketball")
            elif sport_code == "wbb" and school.wbb:
                has_sport = True
                logger.info(f"School {school.school_name} offers Women's Basketball")
            elif sport_code == "fb" and school.fb:
                has_sport = True
                logger.info(f"School {school.school_name} offers Football")
            elif sport_code == "vb" and school.vb:
                has_sport = True
                logger.info(f"School {school.school_name} offers Volleyball")
            elif sport_code == "ba" and school.ba:
                has_sport = True
                logger.info(f"School {school.school_name} offers Baseball")
            elif sport_code == "msoc" and school.msoc:
                has_sport = True
                logger.info(f"School {school.school_name} offers Men's Soccer")
            elif sport_code == "wsoc" and school.wsoc:
                has_sport = True
                logger.info(f"School {school.school_name} offers Women's Soccer")
            elif sport_code == "wr" and school.wr:
                has_sport = True
                logger.info(f"School {school.school_name} offers Wrestling")

            if not has_sport:
                logger.info(
                    f"School {school.school_name} does not offer {sport_code}, skipping"
                )
                continue

            # Get all reviews for this school and sport
            reviews = Reviews.objects.filter(school=school, sport=sport_code)
            logger.info(
                f"Found {reviews.count()} reviews for {school.school_name} - {sport_code}"
            )

            if not reviews:
                logger.info(
                    f"No reviews for {school.school_name} with sport {sport_code}"
                )
                continue

            # Calculate average ratings
            avg_ratings = {
                "head_coach": reviews.aggregate(avg=models.Avg("head_coach"))["avg"]
                or 5,
                "assistant_coaches": reviews.aggregate(
                    avg=models.Avg("assistant_coaches")
                )["avg"]
                or 5,
                "team_culture": reviews.aggregate(avg=models.Avg("team_culture"))["avg"]
                or 5,
                "campus_life": reviews.aggregate(avg=models.Avg("campus_life"))["avg"]
                or 5,
                "athletic_facilities": reviews.aggregate(
                    avg=models.Avg("athletic_facilities")
                )["avg"]
                or 5,
                "athletic_department": reviews.aggregate(
                    avg=models.Avg("athletic_department")
                )["avg"]
                or 5,
                "player_development": reviews.aggregate(
                    avg=models.Avg("player_development")
                )["avg"]
                or 5,
                "nil_opportunity": reviews.aggregate(avg=models.Avg("nil_opportunity"))[
                    "avg"
                ]
                or 5,
            }

            # Calculate similarity score (weighted by user's preference values)
            similarity_score = 0
            total_weight = 0
            baseline = 5  # Neutral baseline for ratings

            for field in avg_ratings:
                if avg_ratings[field] is not None:
                    user_pref = getattr(user_preferences, field)
                    # Use preference as weight
                    weight = user_pref if user_pref > 0 else 1  # Avoid zero weights

                    # Calculate contribution based on preference weight
                    contribution = weight * (avg_ratings[field] - baseline)

                    similarity_score += contribution
                    total_weight += weight

            if total_weight > 0:
                # Normalize to 0-10 scale
                similarity_score = (similarity_score / total_weight) + baseline
                similarity_score = max(
                    0, min(10, similarity_score)
                )  # Ensure score is within bounds

                # Add this school to recommendations
                recommended_schools.append(
                    {
                        "school": SchoolSerializer(
                            school, context={"request": request}
                        ).data,
                        "similarity_score": round(similarity_score, 2),
                        "average_ratings": avg_ratings,
                        "sport": code_to_display.get(sport_code, sport_code),
                    }
                )
                logger.info(
                    f"Added {school.school_name} for {sport_code} with score {similarity_score}"
                )

        # Sort by similarity score and return top schools
        recommended_schools.sort(key=lambda x: x["similarity_score"], reverse=True)
        result = recommended_schools[:5] if recommended_schools else []

        logger.info(f"Returning {len(result)} recommendations")
        return Response(result)

    except Exception as e:
        logger.error(f"Error in get_recommended_schools: {str(e)}", exc_info=True)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def debug_reviews(request, school_id):
    try:
        school = get_object_or_404(Schools, id=school_id)
        reviews = Reviews.objects.filter(school_id=school_id)

        review_data = []
        for review in reviews:
            review_data.append(
                {
                    "id": review.id,
                    "sport": review.sport,
                    "created_at": review.created_at,
                    "message": review.review_message[:100],
                }
            )

        return Response({"school_name": school.school_name, "reviews": review_data})
    except Exception as e:
        logger.error(f"Error in debug_reviews: {str(e)}")
        return Response({"error": str(e)}, status=500)
