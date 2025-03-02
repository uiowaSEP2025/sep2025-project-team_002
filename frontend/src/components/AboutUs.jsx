import React from 'react';
import { useNavigate } from 'react-router-dom';
import annaImage from '../assets/anna.png';

function AboutUs() {
  const navigate = useNavigate();

  // Assign a unique image to each team member
  const teamMembers = [
    { name: "Samantha Pothitakis", role: "Electrical and Computer Engineering, MS student", image: annaImage },
    { name: "Rodrigo Medina", role: "Computer Science, BA student", image: annaImage },
    { name: "Jingming Liang", role: "Electrical and Computer Engineering PhD student", image: annaImage },
    { name: "Yusuf Halim", role: "Computer Science and Engineering, BSE student", image: annaImage },
    { name: "Anna Davis", role: "Master of Computer Science student", image: annaImage }
  ];

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
        <h2>Your go-to platform for the latest in sports transfer insights.</h2>
        <p>We’re a team of five passionate students from the University of Iowa who came together with a shared mission:
          to make the student-athlete transfer process smoother, more transparent, and fair.
          Our journey started in our Software Engineering Projects course, where we realized we had the desire to create something meaningful.</p>

        <p>The spark for this project came from Anna, a former D1 volleyball player who experienced
          firsthand how challenging and unclear the transfer process can be. She brought the idea to the group,
          and from that moment, we were all in. We saw the real impact our platform could have on thousands of
          student-athletes navigating big changes in their careers and lives. Now, we're turning that vision into
          reality—one line of code at a time!</p>

        <h2>Meet our team:</h2>
        {teamMembers.map((member, index) => (
          <div key={index} style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img
              src={member.image}
              alt={member.name}
              style={{ width: '175px', height: '175px', borderRadius: '5%', objectFit: 'cover', marginBottom: '10px' }}
            />
            <p><b>{member.name}</b> <br /> {member.role}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default AboutUs;
