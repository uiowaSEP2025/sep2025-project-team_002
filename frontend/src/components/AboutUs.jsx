import React from 'react';
import { useNavigate } from 'react-router-dom';

function AboutUs() {
  const navigate = useNavigate();

  return (
      <>
      <div style={{
        maxWidth: '900px',
        margin: 'auto',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 25px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            position: 'absolute',
            left: 0
          }}
        >
          ← Back
        </button>
        <h2 style={{
          flex: 1,
          textAlign: 'center',
          margin: 0
        }}>
          Athletic Insider
        </h2>
      </div>
    <div style={{ maxWidth: '900px', margin: 'auto', padding: '20px', backgroundColor: "#f5f5f5" }}>

      <h1>Who we are!</h1>
      <p>Welcome to Athletic Insider, your go-to platform for the latest in sports transfer insights.</p>
    </div>
          </>
  );
}

export default AboutUs;
