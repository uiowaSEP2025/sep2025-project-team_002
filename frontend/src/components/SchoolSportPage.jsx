import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import ReviewSummary from './ReviewSummary';
import ReviewList from './ReviewList';

function SchoolSportPage() {
    const { schoolId, sport } = useParams();

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>
                    {sport} Program
                </Typography>
                <ReviewSummary schoolId={schoolId} sport={sport} />
                <ReviewList schoolId={schoolId} sport={sport} />
            </Box>
        </Container>
    );
}

export default SchoolSportPage; 