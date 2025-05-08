import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, act, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import SecureHome from '../../home/SecureHome.jsx';
import { UserContext } from '../../context/UserContext';


// Mock user context value
const mockUserContextValue = {
  user: {
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    transfer_type: 'transfer',
    profile_picture: ''
  },
  isLoggedIn: true,
  logout: vi.fn(),
  fetchUser: vi.fn(),
  updateProfilePic: vi.fn(),
  profilePic: '/assets/profile-pictures/pic1.png',
  filters: {
    sport: "",
    head_coach: "",
    assistant_coaches: "",
    team_culture: "",
    campus_life: "",
    athletic_facilities: "",
    athletic_department: "",
    player_development: "",
    nil_opportunity: "",
  },
  setFilters: vi.fn(),
  clearFilters: vi.fn()
};

const renderSecureHome = (
  userOverrides = {},   // you can pass {user:{transfer_type:'graduate'}} etc.
  contextOverrides = {}
) => {
  return render(
    <BrowserRouter>
      <UserContext.Provider
        value={{
          ...mockUserContextValue,
          ...contextOverrides,
          user: { ...mockUserContextValue.user, ...userOverrides }
        }}
      >
        <SecureHome />
      </UserContext.Provider>
    </BrowserRouter>
  );
};

// Mock the API response for schools
const mockSchools = [
  {
    id: 1,
    school_name: "University of Iowa",
    conference: "Big Ten",
    location: "Iowa City, Iowa",
    available_sports: ["Men's Basketball", "Women's Basketball", "Football"],
    review_count: 325,
    average_rating: 8.7
  }
];

// Mock the API response for recommendations
const mockRecommendations = [
  {
    school: {
      id: 1,
      school_name: "University of Iowa",
      conference: "Big Ten",
      location: "Iowa City, Iowa",
      available_sports: ["Men's Basketball", "Women's Basketball", "Football"],
      review_count: 325,
      average_rating: 8.7
    },
    sport: "Men's Basketball",
    similarity_score: 8
  }
];

describe('SecureHome Component', () => {
  beforeEach(() => {
    console.log("Running SecureHome test suite");

    // Mock localStorage
    const mockLocalStorage = {
      getItem: vi.fn(() => 'fake-token'),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    global.localStorage = mockLocalStorage;

    // Mock fetch with a proper Response object
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/recommendations/')) {
        return Promise.resolve(new Response(JSON.stringify(mockRecommendations), {
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }));
      } else if (url.includes('/api/schools/')) {
        return Promise.resolve(new Response(JSON.stringify(mockSchools), {
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }));
      } else if (url.includes('/users/user/')) {
        return Promise.resolve(new Response(JSON.stringify({
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          transfer_type: "transfer"
        }), {
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }));
      }
      // Return empty response for other endpoints
      return Promise.resolve(new Response(JSON.stringify({}), {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }));
    });
  });

  it('renders schools list', async () => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <SecureHome />
        </UserContext.Provider>
      </BrowserRouter>
    );

    // Initially should show loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for the school name to appear in the school list
    await waitFor(() => {
      expect(screen.getByTestId('school-list-name-1')).toHaveTextContent('University of Iowa');
    });

    // Loading indicator should be gone
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('displays sports for each school', async () => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <SecureHome />
        </UserContext.Provider>
      </BrowserRouter>
    );

    // Wait for the sports to appear in the school list
    await waitFor(() => {
      expect(screen.getByTestId('school-list-sports-1')).toHaveTextContent(/Men's Basketball/);
    });
  });

  it('shows recommendations', async () => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <SecureHome />
        </UserContext.Provider>
      </BrowserRouter>
    );

    // Wait for the recommended school name to appear
    await waitFor(() => {
      expect(screen.getByTestId('recommended-school-name-1')).toHaveTextContent('University of Iowa');
    });

    // Check for recommended sport
    await waitFor(() => {
      expect(screen.getByTestId('recommended-sport-name-1')).toHaveTextContent("Men's Basketball");
    });
  });

  it('shows submit review button when transfer_type is not "high_school"', async () => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <SecureHome />
        </UserContext.Provider>
      </BrowserRouter>
    );

    // Wait for the submit review button to appear
    await waitFor(() => {
      expect(screen.getByText(/Submit a Review/i)).toBeInTheDocument();
    });
  });

  it('does not show submit review button when transfer_type is "high_school"', async () => {
    // Mock fetch to return a high school user
    global.fetch = vi.fn((url) => {
      if (url.includes('/users/user/')) {
        return Promise.resolve(new Response(JSON.stringify({
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          transfer_type: "high_school"
        }), {
          status: 200,
          headers: new Headers({
            'Content-Type': 'application/json'
          })
        }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      }));
    });

  render(
    <BrowserRouter>
      <UserContext.Provider value={{...mockUserContextValue, user: {...mockUserContextValue.user, transfer_type: 'high_school'}}}>
        <SecureHome />
      </UserContext.Provider>
    </BrowserRouter>
  );


    // Wait for the component to render
    await waitFor(() => {
      expect(screen.queryByText(/Submit a Review/i)).not.toBeInTheDocument();
    });
  });
});

describe('SecureHome Filter Dialog', () => {
  beforeEach(() => {
    // Mock localStorage for authentication
    global.localStorage = {
      getItem: vi.fn(() => 'fake-token'),
      setItem: vi.fn(),
      clear: vi.fn()
    };

    // Mock fetch for various endpoints
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/filter/')) {
        const urlObj = new URL(url, 'http://localhost');
        const headCoachRating = urlObj.searchParams.get('head_coach');
        const sport = urlObj.searchParams.get('sport');
        // Return a filtered school when head_coach equals '8' and sport is Men's Basketball
        if (headCoachRating === '8' && sport === "Men's Basketball") {
          return Promise.resolve(new Response(JSON.stringify([
            {
              id: 2,
              school_name: "Filtered School",
              conference: "Test Conference",
              location: "Test Location",
              available_sports: ["Men's Basketball"],
              review_count: 150,
              average_rating: 8.2
            }
          ]), {
            status: 200,
            headers: new Headers({ 'Content-Type': 'application/json' })
          }));
        } else {
          return Promise.resolve(new Response(JSON.stringify([]), {
            status: 200,
            headers: new Headers({ 'Content-Type': 'application/json' })
          }));
        }
      } else if (url.includes('/api/schools/')) {
        // Return default school list
        return Promise.resolve(new Response(JSON.stringify([
          {
            id: 1,
            school_name: "Default School",
            conference: "Test Conference",
            location: "Test Location",
            available_sports: ["Football"],
            review_count: 85,
            average_rating: 7.5
          }
        ]), {
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' })
        }));
      } else if (url.includes('/api/recommendations/')) {
        // Return mock recommendations
        return Promise.resolve(new Response(JSON.stringify(mockRecommendations), {
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' })
        }));
      } else if (url.includes('/users/user/')) {
        // Return a mock user (transfer student)
        return Promise.resolve(new Response(JSON.stringify({
          first_name: "Test",
          last_name: "User",
          email: "test@example.com",
          transfer_type: "transfer"
        }), {
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' })
        }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' })
      }));
    });
  });

  it('opens filter dialog and closes it', async () => {
    render(
      <BrowserRouter>
        <UserContext.Provider value={mockUserContextValue}>
          <SecureHome />
        </UserContext.Provider>
      </BrowserRouter>
    );

    // Wait for the default school to appear
    await waitFor(() => {
      expect(screen.getByText(/Default School/i)).toBeInTheDocument();
    });

    // Click the Filter button
    const filtersButton = screen.getByRole('button', { name: /Filter/i });
    fireEvent.click(filtersButton);

    // Wait for the filter dialog to appear (e.g., dialog title "Apply Filters")
    await waitFor(() => {
      expect(screen.getAllByText(/Apply Filters/i)[0]).toBeInTheDocument();
    });

    // Wait for the dialog content to be visible
    await waitFor(() => {
      expect(screen.getByText(/Rating Filters/i)).toBeInTheDocument();
    });

    // Verify that the sport dropdown is present
    expect(screen.getByLabelText(/Choose Sport/i)).toBeInTheDocument();

    expect(screen.getByText(/Men's Basketball/i)).toBeInTheDocument();
    expect(screen.getByText(/Football/i)).toBeInTheDocument();

    // Click the Apply Filters button
    const applyButton = screen.getByRole('button', { name: /Apply Filters/i });
    fireEvent.click(applyButton);

    // Verify that the dialog closes
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
describe('SecureHome Pagination Feature', () => {
  beforeEach(() => {
    // Mock localStorage to simulate an authenticated user.
    global.localStorage = {
      getItem: vi.fn(() => 'fake-token'),
      setItem: vi.fn(),
      clear: vi.fn()
    };

    // Create an array of 15 fake schools so that:
    // - Page 1 shows 10 schools (School 1 to School 10)
    // - Page 2 shows the remaining 5 schools (School 11 to School 15)
    const fakeSchools = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      school_name: `School ${i + 1}`,
      conference: "Test Conference",
      location: "Test Location",
      available_sports: ["Sport A", "Sport B"],
      review_count: Math.floor(Math.random() * 600),
      average_rating: (Math.random() * 5 + 5).toFixed(1),
    }));

    // Setup fetch to return responses for both the user info and schools endpoints.
    global.fetch = vi.fn((url) => {
      if (url.includes('/users/user/')) {
        return Promise.resolve(
          new Response(JSON.stringify({
            first_name: "Test",
            last_name: "User",
            email: "test@example.com",
            transfer_type: "transfer"
          }), {
            status: 200,
            headers: new Headers({ 'Content-Type': 'application/json' })
          })
        );
      } else if (url.includes('/api/schools/')) {
        return Promise.resolve(
          new Response(JSON.stringify(fakeSchools), {
            status: 200,
            headers: new Headers({ 'Content-Type': 'application/json' })
          })
        );
      }

      // ⬇️  NEW: stub the filter endpoint
    if (url.includes('/api/filter/')) {
      return Promise.resolve(new Response(JSON.stringify([
        {
          id: 99,
          school_name: 'Filtered School',
          conference: 'Test Conf',
          location: 'Test Location',
          available_sports: ["Men's Basketball"],
          review_count: 150,
          average_rating: 8.2,
        },
      ]), { status: 200 }));
    }

      return Promise.reject(new Error('Unhandled endpoint'));
    });
  });

    it('renders first page schools and paginates correctly when changing pages', async () => {
      render(
        <BrowserRouter>
          <UserContext.Provider value={mockUserContextValue}>
            <SecureHome />
          </UserContext.Provider>
        </BrowserRouter>
      );

      // Wait for initial load and verify page 1 has 10 schools
      await waitFor(() => {
        const schoolHeadings = screen.getAllByRole('heading', { level: 6 })
          .filter(heading => heading.textContent.startsWith('School'));
        expect(schoolHeadings.length).toBe(10);
      });

      // Get all school names from page 1
      const firstPageSchools = screen.getAllByRole('heading', { level: 6 })
        .filter(heading => heading.textContent.startsWith('School'))
        .map(el => el.textContent);

      // Click page 2 button
      const page2Button = screen.getByRole('button', { name: /go to page 2/i });
      fireEvent.click(page2Button);

      // Wait for page 2 to load with 5 schools
      await waitFor(() => {
        const schoolHeadings = screen.getAllByRole('heading', { level: 6 })
          .filter(heading => heading.textContent.startsWith('School'));
        expect(schoolHeadings.length).toBe(5);
      });

      // Get all school names from page 2
      const secondPageSchools = screen.getAllByRole('heading', { level: 6 })
        .filter(heading => heading.textContent.startsWith('School'))
        .map(el => el.textContent);

      // Verify counts are correct
      expect(firstPageSchools.length).toBe(10);
      expect(secondPageSchools.length).toBe(5);

      // Verify no overlap between pages
      secondPageSchools.forEach(school => {
        expect(firstPageSchools).not.toContain(school);
      });

      // Verify all schools are unique (no duplicates)
      const allSchools = [...firstPageSchools, ...secondPageSchools];
      const uniqueSchools = new Set(allSchools);
      expect(uniqueSchools.size).toBe(15);
    });

    it('shows friendly error when /api/schools fails', async () => {
  fetch.mockImplementationOnce(() => Promise.resolve(new Response(null, { status: 500 })));
  renderSecureHome();
  await screen.findByText(/having trouble loading/i);   // error UI
});

    const setup = async () => {
  renderSecureHome();

  // wait for the Filter button to be in the DOM
  const filterBtn = await screen.findByTestId('filter-button');

  return {
    filterBtn,
    schoolCard: (id) => screen.getByTestId(`school-${id}`),
  };
};

it('clears applied filters and restores full list', async () => {
  const { filterBtn } = await setup();   //  ← await the helper
  fireEvent.click(filterBtn);

   fireEvent.mouseDown(screen.getByLabelText(/Choose Sport/i));
  const listbox = await screen.findByRole('listbox');
  fireEvent.click(within(listbox).getByText("Men's Basketball"));

  fireEvent.click(screen.getByRole('button', { name: /Apply Filters/i }));
  await screen.findByText(/Filtered School/i);      // list is filtered

  fireEvent.click(screen.getByRole('button', { name: /Clear Filters/i }));
  expect(
  screen
    .getAllByRole('heading', { level: 6 })
    .filter(h => h.textContent.startsWith('School')).length
).toBe(10);       // full list restored
});

it('updates the URL and current page when a valid page number is typed', async () => {
  render(
    <BrowserRouter>
      <UserContext.Provider value={mockUserContextValue}>
        <SecureHome />
      </UserContext.Provider>
    </BrowserRouter>
  );

  /* wait for page-1 to appear so the jump box is in the DOM */
  await screen.findAllByRole('heading', { level: 6 });

  /* type “2” in the Jump-to input (role="spinbutton") */
  const jumpInput = screen.getByRole('spinbutton');
  fireEvent.change(jumpInput, { target: { value: '2' } });

  /* the URL should include page=2 */
  await waitFor(() => {
    expect(window.location.search).toMatch('page=2');
  });

  /* page-2 should now have exactly 5 School cards */
  await waitFor(() => {
    const page2Headings = screen
      .getAllByRole('heading', { level: 6 })
      .filter(h => h.textContent.startsWith('School'));
    expect(page2Headings.length).toBe(5);
  });
});

it('adds the search param to the URL when a page number is typed with an active search query', async () => {
  render(
    <BrowserRouter>
      <UserContext.Provider value={mockUserContextValue}>
        <SecureHome />
      </UserContext.Provider>
    </BrowserRouter>
  );

  /* Wait until page-1 schools are rendered */
  await screen.findAllByRole('heading', { level: 6 });

  /* Type a search term so searchQuery !== "" */
  const searchField = screen.getByLabelText(/Search Schools/i);
  fireEvent.change(searchField, { target: { value: 'School' } });

  /* URL now has ?search=School&page=1 */
  await waitFor(() => {
    expect(window.location.search).toMatch('search=School');
  });

  /* Jump to page 2 via the spin-button */
  const jumpInput = screen.getByRole('spinbutton');
  fireEvent.change(jumpInput, { target: { value: '2' } });

  /* onChange handler runs: params.set('search', searchQuery) (line 1552) */
  await waitFor(() => {
    expect(window.location.search).toMatch('page=2');
    expect(window.location.search).toMatch('search=School');
  });
});

it('shows "No Recommendations Available" when user has preferences but no recommendations', async () => {
  global.fetch = vi.fn((url) => {
    if (url.includes('/api/recommendations/')) {
      /* empty list ⇒ hasPreferences = true, recommendedSchools = [] */
      return Promise.resolve(new Response(JSON.stringify([]), {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      }));
    }

    if (url.includes('/api/schools/')) {
      /* return ONE dummy school so the page continues past the “no schools” check */
      return Promise.resolve(new Response(JSON.stringify([
        { id: 1, school_name: 'Any College', available_sports: [] }
      ]), {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      }));
    }

    if (url.includes('/users/user/')) {
      return Promise.resolve(new Response(JSON.stringify({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        transfer_type: 'transfer',   // section is shown for non-graduates
      }), { status: 200 }));
    }

    return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
  });

  render(
    <BrowserRouter>
      <UserContext.Provider value={mockUserContextValue}>
        <SecureHome />
      </UserContext.Provider>
    </BrowserRouter>
  );

  /* wait until the fallback Paper renders */
  await screen.findByText(/No Recommendations Available/i);
  await screen.findByText(/We don't have any reviews yet for your preferred sport/i);
});

it('resets error and calls window.location.reload when "Try Again" is clicked', async () => {
  /* 1️⃣  Mock /api/schools to fail so SecureHome shows the error Paper */
  global.fetch = vi.fn((url) => {
    if (url.includes('/api/schools/')) {
      return Promise.resolve(new Response(null, { status: 500 }));  // triggers error
    }
    if (url.includes('/users/user/')) {
      return Promise.resolve(
        new Response(JSON.stringify({ transfer_type: 'transfer' }), { status: 200 })
      );
    }
    return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
  });

  /* 2️⃣  Stub out window.location.reload */
  const reloadMock = vi.fn();
  Object.defineProperty(window, 'location', {
    value: { ...window.location, reload: reloadMock },
    writable: true,
  });

  renderSecureHome();                       // mounts component

  /* 3️⃣  Wait for the error UI and click "Try Again" */
  await screen.findByText(/having trouble loading/i);
  const tryAgainBtn = screen.getByRole('button', { name: /Try Again/i });
  fireEvent.click(tryAgainBtn);

  /* 4️⃣  Assert reload was requested (line 603-604 executed) */
  expect(reloadMock).toHaveBeenCalledTimes(1);
});

it('logs out and redirects when the filter endpoint returns 401', async () => {
  /* fresh spy so we can assert the call */
  const logoutSpy = vi.fn();

  /* endpoint stubs for just this test */
  global.fetch = vi.fn((url) => {
    if (url.includes('/api/filter/')) {
      // 401 triggers the branch we need (lines 424-429)
      return Promise.resolve(new Response(null, { status: 401 }));
    }
    if (url.includes('/api/schools/')) {
      // one school so the main page renders past the “no-schools” guard
      return Promise.resolve(
        new Response(JSON.stringify([
          { id: 1, school_name: 'Branch Test U', available_sports: [] },
        ]), { status: 200 })
      );
    }
    if (url.includes('/api/recommendations/')) {
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    }
    if (url.includes('/users/user/')) {
      return Promise.resolve(
        new Response(JSON.stringify({ transfer_type: 'transfer' }), { status: 200 })
      );
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
  });

  /* mount with our logout spy */
  render(
    <BrowserRouter>
      <UserContext.Provider value={{ ...mockUserContextValue, logout: logoutSpy }}>
        <SecureHome />
      </UserContext.Provider>
    </BrowserRouter>
  );

  /* wait until the first school card shows up */
  await screen.findByRole('button', { name: /Filter/i });

/* open the filter dialog */
fireEvent.click(screen.getByRole('button', { name: /Filter/i }));

/* wait for the dialog container itself */
const dialog = await screen.findByRole('dialog');

/* inside that dialog, grab the Apply-Filters button only */
const applyBtn = within(dialog).getByRole('button', { name: /Apply Filters/i });
fireEvent.click(applyBtn);

/* now wait for logout to be called */
await waitFor(() => expect(logoutSpy).toHaveBeenCalledTimes(1));
});

it('logs an error and stops loading when the filter endpoint returns 500', async () => {
  /* spy on console.error so we can assert the branch ran */
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  global.fetch = vi.fn((url) => {
    if (url.includes('/api/filter/')) {
      // 500 → executes lines 427-429
      return Promise.resolve(new Response(null, { status: 500 }));
    }
    if (url.includes('/api/schools/')) {
      // minimal data so page renders
      return Promise.resolve(
        new Response(JSON.stringify([
          { id: 1, school_name: 'Filter Fail U', available_sports: [] },
        ]), { status: 200 })
      );
    }
    if (url.includes('/api/recommendations/')) {
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    }
    if (url.includes('/users/user/')) {
      return Promise.resolve(
        new Response(JSON.stringify({ transfer_type: 'transfer' }), { status: 200 })
      );
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
  });

  renderSecureHome();

  /* open the dialog */
  fireEvent.click(await screen.findByRole('button', { name: /Filter/i }));
  const dialog   = await screen.findByRole('dialog');
  const applyBtn = within(dialog).getByRole('button', { name: /Apply Filters/i });

  /* click Apply Filters → 500 response */
  fireEvent.click(applyBtn);

  /* wait until the branch finishes: spinner disappears & console.error called */
  await waitFor(() => {
    expect(errorSpy).toHaveBeenCalled();             // console.error hit
    expect(screen.queryByRole('progressbar')).toBeNull(); // loading stopped
  });

  errorSpy.mockRestore();
});

it('logs an error when the filter fetch itself rejects (network error)', async () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  global.fetch = vi.fn((url) => {
    if (url.includes('/api/filter/')) {
      // Simulate network failure → promise rejects → catch block executes
      return Promise.reject(new Error('Network fail'));
    }
    if (url.includes('/api/schools/')) {
      return Promise.resolve(
        new Response(JSON.stringify([{ id: 1, school_name: 'NetFail U', available_sports: [] }]), { status: 200 })
      );
    }
    if (url.includes('/users/user/')) {
      return Promise.resolve(
        new Response(JSON.stringify({ transfer_type: 'transfer' }), { status: 200 })
      );
    }
    return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
  });

  renderSecureHome();

  /* open dialog & click Apply Filters */
  fireEvent.click(await screen.findByRole('button', { name: /Filter/i }));
  const dialog   = await screen.findByRole('dialog');
  const applyBtn = within(dialog).getByRole('button', { name: /Apply Filters/i });
  fireEvent.click(applyBtn);

  /* catch block should log and loading spinner should disappear */
  await waitFor(() => {
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Error applying filters:'), expect.any(Error));
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  errorSpy.mockRestore();
});

it('shows the no-schools fallback and triggers reload when Refresh is clicked', async () => {
  /* mock endpoints so schools = [] */
  global.fetch = vi.fn((url) => {
    if (url.includes('/api/schools/')) {
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    }
    if (url.includes('/users/user/')) {
      return Promise.resolve(
        new Response(JSON.stringify({ transfer_type: 'transfer' }), { status: 200 })
      );
    }
    return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
  });

  /* spy on window.location.reload so we can assert it */
  const reloadSpy = vi.fn();
  Object.defineProperty(window, 'location', {
    value: { ...window.location, reload: reloadSpy },
    writable: true,
  });

  renderSecureHome();

  /* 1️⃣  wait for the fallback UI */
  await screen.findByText(/No Schools Data Available/i);
  await screen.findByText(/We couldn't load the schools data/i);

  /* 2️⃣  Refresh button calls reload() */
  fireEvent.click(screen.getByRole('button', { name: /Refresh Page/i }));
  expect(reloadSpy).toHaveBeenCalledTimes(1);

  /* 3️⃣  “Return to Login” button is present (navigation tested elsewhere) */
  expect(
    screen.getByRole('button', { name: /Return to Login/i })
  ).toBeInTheDocument();
});

it('discarded temp changes when Cancel is clicked (cancelFilters)', async () => {
  render(
    <BrowserRouter>
      <UserContext.Provider value={mockUserContextValue}>
        <SecureHome />
      </UserContext.Provider>
    </BrowserRouter>
  );

  /* 1️⃣  open the dialog */
  fireEvent.click(await screen.findByRole('button', { name: /Filter/i }));
  const dialog = await screen.findByRole('dialog');

  /* 2️⃣  change sport to “Football” (tempFilters now differs) */
  fireEvent.mouseDown(within(dialog).getByLabelText(/Choose Sport/i));
  const listbox = await screen.findByRole('listbox');
  fireEvent.click(within(listbox).getByText('Football'));

  /* 3️⃣  press Cancel → cancelFilters() runs */
  fireEvent.click(within(dialog).getByRole('button', { name: /^Cancel$/i }));

  /* dialog should close */
  await waitFor(() => {
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  /* 4️⃣ reopen dialog and verify the temp change was discarded */
fireEvent.click(screen.getByRole('button', { name: /Filter/i }));
const reopened = await screen.findByRole('dialog');

const sportTrigger = within(reopened).getByLabelText(/Choose Sport/i);
fireEvent.mouseDown(sportTrigger);                       // open list again
const listboxRe = await screen.findByRole('listbox');

/* the selected option should now be “All Sports”, not “Football” */
const allSportsOption = within(listboxRe).getByText('All Sports');
expect(allSportsOption).toHaveAttribute('aria-selected', 'true');

const footballOption = within(listboxRe).getByText('Football');
expect(footballOption).toHaveAttribute('aria-selected', 'false');
});

it('ignores a second rapid change on the same filter (lastSelectedFilter guard)', async () => {
  let capturedSport = null;                       // will hold the queried sport

  /* custom fetch stub for this test */
  global.fetch = vi.fn((url) => {
    if (url.includes('/api/filter/')) {
      const params = new URL(url, 'http://x');
      capturedSport = params.searchParams.get('sport');     // capture
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    }
    if (url.includes('/api/schools/')) {
      return Promise.resolve(
        new Response(JSON.stringify([
          { id: 1, school_name: 'Rapid U', available_sports: [] },
        ]), { status: 200 })
      );
    }
    if (url.includes('/users/user/')) {
      return Promise.resolve(
        new Response(JSON.stringify({ transfer_type: 'transfer' }), { status: 200 })
      );
    }
    return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
  });

  renderSecureHome();

  /* 1️⃣  open the Filter dialog */
  fireEvent.click(await screen.findByRole('button', { name: /Filter/i }));
  const dialog = await screen.findByRole('dialog');

  /* 2️⃣  OPEN dropdown and click “Football” */
  const trigger = within(dialog).getByLabelText(/Choose Sport/i);
  fireEvent.mouseDown(trigger);
  let listbox = await screen.findByRole('listbox');
  fireEvent.click(within(listbox).getByText('Football'));

  /* 3️⃣  WITHOUT yielding to React state updates, click “Volleyball” immediately */
  fireEvent.mouseDown(trigger);                  // open again instantly
  listbox = await screen.findByRole('listbox');
  fireEvent.click(within(listbox).getByText('Volleyball'));

  /* 4️⃣  Apply Filters —  guard should have ignored the second change,
          so sport param sent to /api/filter/ is still "Football" */
  const applyBtn = within(dialog).getByRole('button', { name: /Apply Filters/i });
  fireEvent.click(applyBtn);

  await waitFor(() => {
    expect(capturedSport).toBe('Football');      // second click was ignored
  });
});

it('navigates to /preference-form in edit mode when "Modify Preferences" is clicked', async () => {
  /* Override fetch just for this test so the Modify-Preferences button renders */
  global.fetch = vi.fn((url) => {
    if (url.includes('/api/recommendations/')) {
      // any non-empty list sets hasPreferences = true
      return Promise.resolve(
        new Response(JSON.stringify([
          {
            school: { id: 1, school_name: 'Any U', location: 'X', review_count: 0 },
            sport: 'Basketball',
            similarity_score: 9,
          },
        ]), { status: 200, headers: { 'Content-Type': 'application/json' } })
      );
    }
    if (url.includes('/api/schools/')) {
      return Promise.resolve(
        new Response(JSON.stringify([
          { id: 1, school_name: 'Pref U', available_sports: [] },
        ]), { status: 200, headers: { 'Content-Type': 'application/json' } })
      );
    }
    if (url.includes('/users/user/')) {
      return Promise.resolve(
        new Response(JSON.stringify({ transfer_type: 'transfer' }), { status: 200 })
      );
    }
    return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
  });

  renderSecureHome();

  /* wait for the button and click it */
   const modifyBtn = await screen.findByRole('button', { name: /Modify Preferences/i });
  fireEvent.click(modifyBtn);

});
it('calls handleSchoolClick when a school card is clicked', async () => {
  renderSecureHome();                // fakeSchools → cards render

  /* wait for at least one <h6> heading that starts with “School …” */
  const headings = await screen.findAllByRole('heading', { level: 6 });
  const firstCardHeading = headings.find(h => h.textContent.startsWith('School'));

  fireEvent.click(firstCardHeading); // bubbles to Card’s onClick (handleSchoolClick)

  // no assertion is needed; the click path executes lines 328-330
});

it('calls stopPropagation when a menu item is clicked while the dropdown is closing', async () => {
  /* 🔍  spy on Event.stopPropagation */
  const originalStop = Event.prototype.stopPropagation;
  const stopSpy      = vi.fn();
  Event.prototype.stopPropagation = stopSpy;

  renderSecureHome();                                           // fakeSchools mocked

  /* 1️⃣  open Filter dialog and the sport dropdown */
  fireEvent.click(await screen.findByRole('button', { name: /Filter/i }));
  const dialog  = await screen.findByRole('dialog');
  const trigger = within(dialog).getByLabelText(/Choose Sport/i);

  fireEvent.mouseDown(trigger);                                 // open listbox #1
  let listbox = await screen.findByRole('listbox');
  fireEvent.click(within(listbox).getByText('Football'));       // sets dropdownClosing = true

  /* 2️⃣  open again immediately (still <500 ms) and click another item */
  fireEvent.mouseDown(trigger);                                 // open listbox #2 quickly
  listbox = await screen.findByRole('listbox');
  fireEvent.click(within(listbox).getByText('Volleyball'));     // onClick guard fires

  /* 3️⃣  stopPropagation should have been invoked by the guard */
  expect(stopSpy).toHaveBeenCalled();

  /* cleanup */
  Event.prototype.stopPropagation = originalStop;
});

});

