import React, { useState } from 'react';

function ReportIssue() {
  const [isOpen, setIsOpen] = useState(false);
  const [issueDescription, setIssueDescription] = useState('');

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setIssueDescription('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/report/report_issue/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: issueDescription }),
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

  return (
    <>
      <button
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999
        }}
        onClick={openModal}
      >
        Report Issue
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 10000
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '20px',
              borderRadius: '8px',
              width: '400px',
              maxWidth: '90%'
            }}
          >
            <h2>Report an Issue</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                style={{ width: '100%', height: '100px' }}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Please describe the issue in detail..."
              />
              <div style={{ marginTop: '10px' }}>
                <button type="submit">Submit</button>
                <button type="button" onClick={closeModal} style={{ marginLeft: '10px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ReportIssue;