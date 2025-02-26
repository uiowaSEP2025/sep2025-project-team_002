import React, { useState } from 'react';

function Footer() {
  // Control the open/close state of the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Store the user's inputs
  const [issueDescription, setIssueDescription] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Function to open the modal
  const openModal = () => setIsModalOpen(true);

  // Function to close the modal and reset the inputs
  const closeModal = () => {
    setIsModalOpen(false);
    setIssueDescription('');
    setEmail('');
    setName('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/report/report_issue/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send email, name, and description to the backend
        body: JSON.stringify({
          email: email,
          name: name,
          description: issueDescription
        }),
      });
      if (response.ok) {
        alert('Your issue has been submitted. Thank you for your feedback!');
        closeModal();
      } else {
        alert('Submission failed. Please try again later.');
      }
    } catch (error) {
      console.error(error);
      alert('Submission error. Please check your network or server.');
    }
  };

  // Common pill-shaped button style for the Submit button
  const pillButtonStyle = {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '25px',
    padding: '12px 24px',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
    marginTop: '10px',
  };

  return (
    <>
      {/* Fixed footer bar */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          backgroundColor: '#333',
          color: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px 20px',
          zIndex: 9999,
          fontSize: '16px'
        }}
      >
        <span>© 2025 Athletic Insider</span>
        <span style={{ margin: '0 10px' }}>|</span>
        {/* Clickable text to open the report modal */}
        <span
          onClick={openModal}
          style={{
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          Report Issue
        </span>
      </footer>

      {/* Modal overlay */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
          }}
        >
          <div
            style={{
              position: 'relative',
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              width: '400px',
              maxWidth: '90%',
              textAlign: 'center'
            }}
          >
            {/* Close (X) icon in the top-right corner */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>

            <h2>Report an Issue</h2>
            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              {/* Email (required) */}
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: '10px',
                  padding: '8px',
                  boxSizing: 'border-box'
                }}
              />

              {/* Name (optional) */}
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: '10px',
                  padding: '8px',
                  boxSizing: 'border-box'
                }}
              />

              {/* Issue description */}
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Issue Description *
              </label>
              <textarea
                style={{
                  width: '100%',
                  height: '100px',
                  marginBottom: '10px',
                  padding: '8px',
                  boxSizing: 'border-box'
                }}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Please describe the issue in detail..."
                required
              />

              {/* Submit button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  style={pillButtonStyle}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;
