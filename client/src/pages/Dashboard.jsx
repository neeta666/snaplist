import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboardService';
import { getListings } from '../services/listingService';
import { extractApiError } from '../lib/apiErrors';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const DASHBOARD_LISTINGS_LIMIT = 4;

const statusLabels = { draft: 'Draft', active: 'Active', sold: 'Sold' };

const statConfig = [
  { key: 'totalListings', label: 'Total', icon: TotalIcon },
  { key: 'draftListings', label: 'Draft', icon: DraftIcon },
  { key: 'activeListings', label: 'Active', icon: ActiveIcon },
  { key: 'soldListings', label: 'Sold', icon: SoldIcon },
];

function TotalIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
    </svg>
  );
}

function DraftIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ActiveIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function SoldIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L4 3v5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l3.59-3.59a2 2 0 0 0 0-2.83Z" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
  );
}

function ListingCardContent({ listing }) {
  return (
    <>
      <img src={listing.image.url} alt={listing.title} className="h-32 w-full rounded-t-md object-cover" />
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-ink">{listing.title}</h3>
        <p className="mt-1 text-sm font-semibold text-ink">₹{listing.askingPrice}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge status={listing.status}>{statusLabels[listing.status] || listing.status}</Badge>
          {listing.category && <Badge>{listing.category}</Badge>}
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  const [recentListings, setRecentListings] = useState([]);
  const [isListingsLoading, setIsListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      setIsStatsLoading(true);
      setStatsError('');
      try {
        const result = await getDashboardStats();
        if (isMounted) setStats(result);
      } catch (err) {
        const { message } = extractApiError(err);
        if (isMounted) setStatsError(message);
      } finally {
        if (isMounted) setIsStatsLoading(false);
      }
    }

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecentListings() {
      setIsListingsLoading(true);
      setListingsError('');
      try {
        const result = await getListings({ limit: DASHBOARD_LISTINGS_LIMIT });
        if (isMounted) setRecentListings(result.items);
      } catch (err) {
        const { message } = extractApiError(err);
        if (isMounted) setListingsError(message);
      } finally {
        if (isMounted) setIsListingsLoading(false);
      }
    }

    fetchRecentListings();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Welcome back, {user?.name || 'there'}</h1>
      <p className="mt-1 text-sm text-ink-muted">Here's an overview of your listings.</p>

      <div className="mt-6">
        {isStatsLoading ? (
          <p className="text-sm text-ink-muted">Loading stats...</p>
        ) : statsError ? (
          <p className="text-sm text-danger">{statsError}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {statConfig.map(({ key, label, icon: Icon }) => (
              <Card key={key} className="p-4">
                <div className="flex items-center gap-2 text-ink-muted">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{label}</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-ink">{stats[key]}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Your Listings</h2>
          <Link to="/listings" className="text-sm font-medium text-brand hover:text-brand-hover">
            View all
          </Link>
        </div>

        <div className="mt-4">
          {isListingsLoading ? (
            <p className="text-sm text-ink-muted">Loading listings...</p>
          ) : listingsError ? (
            <p className="text-sm text-danger">{listingsError}</p>
          ) : recentListings.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-sm text-ink-muted">You haven't created any listings yet.</p>
              <Button className="mt-4" onClick={() => navigate('/listings/new')}>
                Create your first listing
              </Button>
            </Card>
          ) : (
            <>
              <div className="hidden md:grid md:grid-cols-4 md:gap-4">
                {recentListings.map((listing) => (
                  <Link key={listing.id} to={`/listings/${listing.id}`}>
                    <Card className="overflow-hidden hover:border-border-strong">
                      <ListingCardContent listing={listing} />
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 md:hidden">
                {recentListings.map((listing) => (
                  <Link key={listing.id} to={`/listings/${listing.id}`} className="w-40 shrink-0">
                    <Card className="overflow-hidden hover:border-border-strong">
                      <ListingCardContent listing={listing} />
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {!isStatsLoading && !statsError && stats.byCategory.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-ink">By category</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {stats.byCategory.map((entry) => (
              <Card key={entry.category} className="px-4 py-3">
                <span className="text-sm text-ink-muted">{entry.category}</span>
                <p className="mt-1 text-lg font-semibold text-ink">{entry.count}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}