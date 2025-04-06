import React from 'react';
import { useParams } from 'react-router-dom';
import ReviewSummary from './ReviewSummary';
// import ReviewList from './ReviewList';  // You'll need to create this component

function SchoolSportPage() {
    const { schoolId, sport } = useParams();

    return (
        <div className="school-sport-page">
            <h2>{sport} Program</h2>
            <ReviewSummary schoolId={schoolId} sport={sport} />
            {/*<ReviewList schoolId={schoolId} sport={sport} />*/}
        </div>
    );
}

export default SchoolSportPage; 