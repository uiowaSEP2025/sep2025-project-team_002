import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API_BASE_URL from "../utils/config.js";

function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // State for custom notification
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationIsSuccess, setNotificationIsSuccess] = useState(false);

  // Function to open the modal
  const openModal = () => setIsModalOpen(true);

  // Function to close the modal and reset all inputs
  const closeModal = () => {
    setIsModalOpen(false);
    setIssueDescription('');
    setEmail('');
    setName('');
  };

  // Close the notification
  const closeNotification = () => {
    setShowNotification(false);
    setNotificationMessage('');
    setNotificationIsSuccess(false);
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
        // Show success notification
        setNotificationMessage('Your issue has been submitted. Thank you for your feedback!');
        setNotificationIsSuccess(true);
        setShowNotification(true);

        // Close the modal on success
        closeModal();
      } else {
        // Show error notification
        setNotificationMessage('Submission failed. Please try again later.');
        setNotificationIsSuccess(false);
        setShowNotification(true);
      }
    } catch (error) {
      console.error(error);
      // Show error notification
      setNotificationMessage('Submission error. Please check your network or server.');
      setNotificationIsSuccess(false);
      setShowNotification(true);
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
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '5px',
          zIndex: 9999,
          textAlign: 'center',
          fontSize: '14px'
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
            <span style={{ margin: '0 10px' }}>|</span>
        <Link
          to="/about"
          style={{ color: '#fff', textDecoration: 'underline' }}
        >
          About Us
        </Link>
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
                borderRadius: '0',
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
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
                Email *
              </label>
              <input
                  id="email"
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

              <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
                Name (optional)
              </label>
              <input
                  id="name"
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

              <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>
                Issue Description *
              </label>
              <textarea
                  id="description"
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
                  disabled={!isFormValid}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom notification overlay */}
      {showNotification && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 20000  // higher than the modal
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              minWidth: '300px',
              textAlign: 'center'
            }}
          >
            <p style={{ color: notificationIsSuccess ? '#306731' : '#a13432' }}>
              {notificationMessage}
            </p>
            <button
              onClick={closeNotification}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: notificationIsSuccess ? 'rgba(94,161,94,0.9)' : '#ea6471',
                color: '#fff'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;