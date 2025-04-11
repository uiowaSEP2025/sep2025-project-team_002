import { useState, useEffect } from 'react';
import API_BASE_URL from '../utils/config.js';

function ReviewSummary({ schoolId, sport }) {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            const token = localStorage.getItem('token');

            try {
                // Use public route if no token, otherwise use protected route
                const endpoint = token
                    ? `${API_BASE_URL}/api/schools/${schoolId}/reviews/summary/?sport=${encodeURIComponent(sport)}`
                    : `${API_BASE_URL}/api/public/schools/${schoolId}/reviews/summary/?sport=${encodeURIComponent(sport)}`;

                const headers = token
                    ? {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    : {
                        'Content-Type': 'application/json'
                      };

                const response = await fetch(endpoint, { headers });
                const data = await response.json();

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

        if (sport) {
            fetchSummary();
        }
    }, [schoolId, sport]);

    if (!sport) return null;
    if (loading) return <div>Loading summary...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="review-summary">
            <h3 className="rating-display">{sport} Program Reviews Summary</h3>
            <p>{summary}</p>
        </div>
    );
}

export default ReviewSummary;