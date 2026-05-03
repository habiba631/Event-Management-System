export const users = [
  { id: 'c-1', name: 'Sara Ali', role: 'customer', email: 'sara@email.com' },
  { id: 'o-1', name: 'Omar Hasan', role: 'organizer', email: 'omar@email.com' },
  { id: 'a-1', name: 'Admin User', role: 'admin', email: 'admin@email.com' },
]

export const events = [
  {
    id: 'e-1',
    title: 'Cairo Frontend Bootcamp',
    category: 'Workshop',
    date: '2026-06-20',
    location: 'Greek Campus, Downtown Cairo',
    seatsLeft: 18,
    status: 'open',
    organizer: 'Omar Hasan',
  },
  {
    id: 'e-2',
    title: 'Alexandria Startup Night',
    category: 'Networking',
    date: '2026-05-09',
    location: 'Bibliotheca Alexandrina Plaza',
    seatsLeft: 0,
    status: 'full',
    organizer: 'Omar Hasan',
  },
  {
    id: 'e-3',
    title: 'Design Systems — Egypt Edition',
    category: 'Seminar',
    date: '2026-04-15',
    location: 'Livestream (Egypt time)',
    seatsLeft: 0,
    status: 'completed',
    organizer: 'Omar Hasan',
  },
]

export const customerDashboard = {
  upcomingRegistrations: [
    { id: 'r-1', eventTitle: 'Cairo Frontend Bootcamp', date: '2026-06-20' },
    { id: 'r-2', eventTitle: 'Giza Product Leadership Brunch', date: '2026-06-26' },
  ],
  pastRegistrations: [
    {
      id: 'r-3',
      eventTitle: 'Design Systems — Egypt Edition',
      date: '2026-04-15',
      canReview: true,
      previousRating: 4,
    },
  ],
}

export const organizerDashboard = {
  managedEvents: [
    { id: 'e-1', title: 'Cairo Frontend Bootcamp', registrations: 42, capacity: 60 },
    { id: 'e-2', title: 'Alexandria Startup Night', registrations: 120, capacity: 120 },
  ],
  pendingActions: [
    'Publish Ramadan evening tech meetup (Cairo)',
    'Confirm venue insurance for New Giza outdoor event',
  ],
}

export const adminDashboard = {
  stats: {
    totalUsers: 320,
    totalEvents: 48,
    activeOrganizers: 16,
    pendingReports: 3,
  },
  flaggedItems: [
    'Report #1202: duplicate listing — Cairo Nile dinner cruise',
    'Report #1199: suspicious bulk sign-ups from same IP (Alexandria)',
  ],
}
