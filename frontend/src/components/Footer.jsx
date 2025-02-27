import React, { useState } from 'react';
import API_BASE_URL from "../utils/config.js";

function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Function to open the modal
  const openModal = () => setIsModalOpen(true);

  // Function to close the modal and reset all inputs
  const closeModal = () => {
    setIsModalOpen(false);
    setIssueDescription('');
    setEmail('');
    setName('');
  };

  // Check if required fields are filled
  const isFormValid = email.trim() !== '' && issueDescription.trim() !== '';

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // If form is invalid, do nothing
    if (!isFormValid) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/report/report_issue/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // Pill-shaped button style
  const pillButtonStyle = {
    border: 'none',
    borderRadius: '25px',
    padding: '12px 24px',
    fontSize: '16px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
    marginTop: '10px',
    // Change background color based on form validity
    backgroundColor: isFormValid ? '#007bff' : '#ccc',
    // Change text color based on form validity
    color: isFormValid ? '#fff' : '#666',
    // Change cursor based on form validity
    cursor: isFormValid ? 'pointer' : 'not-allowed'
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
            {/* Square gray-black close button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#555',
                color: '#fff',
                border: 'none',
                borderRadius: '20%',
                width: '20px',
                height: '20px',
                fontSize: '14px',
                lineHeight: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                padding: 0
              }}
            >
              &times;
            </button>

            <h2 style={{ marginBottom: '20px' }}>Report an Issue</h2>
            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: '10px',
                  padding: '8px',
                  boxSizing: 'border-box'
                }}
                required
              />

              <label style={{ display: 'block', marginBottom: '5px' }}>
                Name (optional)
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

              <label style={{ display: 'block', marginBottom: '5px' }}>
                Issue Description *
              </label>
              <textarea
                style={{
                  width: '100%',
                  height: '80px',
                  marginBottom: '10px',
                  padding: '8px',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  maxHeight: '150px'
                }}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Please describe the issue in detail..."
                required
              />

              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  style={pillButtonStyle}
                  disabled={!isFormValid} // disable if not valid
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
