import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReviewSummary from '../../components/ReviewSummary';
import API_BASE_URL from '../../utils/config';

// Mock the fetch function
global.fetch = vi.fn();

describe('ReviewSummary Component', () => {
  const mockSchoolId = '123';
  const mockSport = "Men's Basketball";

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  it('displays loading state initially', () => {
    render(<ReviewSummary schoolId={mockSchoolId} sport={mockSport} />);
    expect(screen.getByText('Loading summary...')).toBeInTheDocument();
  });

  it('displays "No summary available" when there are no reviews', async () => {
    // Mock the API response for no reviews
    const mockResponse = {
      summary: ''
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    render(<ReviewSummary schoolId={mockSchoolId} sport={mockSport} />);

    // Wait for the loading state to disappear and check for the message
    const noSummaryMessage = await screen.findByText('No summary available');
    expect(noSummaryMessage).toBeInTheDocument();
  });

  it('displays coach summary with "no tenure at this school" message', async () => {
    // Mock the API response with a coach summary that includes "no tenure at this school"
    const mockResponse = {
      summary: `**John Smith**: According to reviews, John Smith has no tenure at this school. Reviewers state that his coaching style is still being evaluated by the team.\n\n**Program Overview**: The athletic facilities are modern and well-maintained.`
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    render(<ReviewSummary schoolId={mockSchoolId} sport={mockSport} />);

    // Wait for the loading state to disappear and check for the coach name
    const coachName = await screen.findByText('John Smith');
    expect(coachName).toBeInTheDocument();

    // Check for the "no tenure" message
    const noTenureMessage = await screen.findByText(/no tenure at this school/);
    expect(noTenureMessage).toBeInTheDocument();

    // Check for the program overview
    const programOverview = await screen.findByText(/Program Overview/);
    expect(programOverview).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    // Mock a failed API response
    fetch.mockRejectedValueOnce(new Error('API Error'));

    render(<ReviewSummary schoolId={mockSchoolId} sport={mockSport} />);

    // Check for error message
    const errorMessage = await screen.findByText('Failed to fetch summary');
    expect(errorMessage).toBeInTheDocument();
  });

  it('does not render when sport is not provided', () => {
    const { container } = render(<ReviewSummary schoolId={mockSchoolId} sport={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('uses public route when no token is present', async () => {
    const mockResponse = {
      summary: 'Test summary'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    render(<ReviewSummary schoolId={mockSchoolId} sport={mockSport} />);

    // Verify the fetch was called with the public endpoint
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/public/schools/'),
      expect.any(Object)
    );
  });

  it('uses protected route when token is present', async () => {
    localStorage.setItem('token', 'test-token');
    
    const mockResponse = {
      summary: 'Test summary'
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    render(<ReviewSummary schoolId={mockSchoolId} sport={mockSport} />);

    // Verify the fetch was called with the protected endpoint and auth header
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/schools/'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      })
    );
  });
}); 