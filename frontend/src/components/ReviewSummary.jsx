import { useState, useEffect } from 'react';
import API_BASE_URL from '../utils/config.js';

function ReviewSummary({ schoolId }) {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            const token = localStorage.getItem('token');
            console.log('Attempting to fetch summary for school:', schoolId);
            console.log('Token exists:', !!token);
            
            try {
                // Use public route if no token, otherwise use protected route
                const endpoint = token
                    ? `${API_BASE_URL}/api/schools/${schoolId}/reviews/summary/`
                    : `${API_BASE_URL}/api/public/schools/${schoolId}/reviews/summary/`;

                const headers = token
                    ? {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    : {
                        'Content-Type': 'application/json'
                      };

                const response = await fetch(endpoint, { headers });
                console.log('Response status:', response.status);
                
                const data = await response.json();
                console.log('Response data:', data);
                
                if (response.ok) {
                    setSummary(data.summary);
                } else {
                    setError(data.error || 'Failed to fetch summary');
                    console.error('Error response:', data);
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to fetch review summary');
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [schoolId]);

    if (loading) return <div>Loading summary...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="review-summary-box">
            <h3>Review Summary</h3>
            <p>{summary}</p>
        </div>
    );
}

export default ReviewSummary; 