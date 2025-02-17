import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API_BASE_URL from "../utils/config";

function SchoolDetail() {
    const [school, setSchool] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        fetchSchoolDetail();
    }, [id]);

    const fetchSchoolDetail = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/schools/${id}/`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSchool(data);
            } else {
                console.error('Error fetching school details');
            }
        } catch (error) {
            console.error('Error fetching school details:', error);
        }
    };

    if (!school) return <div>Loading...</div>;

    return (
        <div className="school-detail">
            <h2>{school.school_name}</h2>
            <p>Conference: {school.conference}</p>
            
            <h3>Sports</h3>
            <div className="sports-list">
                {school.ports && school.ports.map((port) => (
                    <div key={port.id} className="sport-item">
                        <h4>{port.name}</h4>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SchoolDetail; 