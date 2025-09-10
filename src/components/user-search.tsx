import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { fetchGithubUser, searchGithubUser } from '../api/github';
import UserCard from './user-card';
import RecentSearches from './recent-searches';
import { useDebounce } from 'use-debounce';

import SuggestionDropdown from './suggetions-dropdown';

const UserSearch = () => {
  const [username, setUsername] = useState('');
  const [submittedUserName, setSubmittedUsername] = useState('');
  const [recentUsers, setRecentUsers] = useState<string[]>(() => {
    const stored = localStorage.getItem('recent');
    return stored ? JSON.parse(stored) : [];
  });
  const [debouncedUsername] = useDebounce(username, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // query to search specific users
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users', submittedUserName],
    queryFn: () => fetchGithubUser(submittedUserName),
    enabled: !!submittedUserName,
  });

  // query to fetch suggetions for the userSearch
  const { data: suggestions } = useQuery({
    queryKey: ['github-user-suggestions', debouncedUsername],
    queryFn: () => searchGithubUser(debouncedUsername),
    enabled: debouncedUsername.length > 1,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    setSubmittedUsername(trimmed);
    setUsername('');
    setRecentUsers((prev) => {
      const updated = [trimmed, ...prev.filter((u) => u !== trimmed)];
      return updated.slice(0, 5);
    });
  };

  useEffect(() => {
    localStorage.setItem('recent', JSON.stringify(recentUsers));
  }, [recentUsers]);
  return (
    <>
      <form onSubmit={handleSubmit} className="form">
        <div className="dropdown-wrapper">
          <input
            type="text"
            placeholder="Enter Github Username..."
            value={username}
            onChange={(e) => {
              const value = e.target.value;
              setUsername(value);
              setShowSuggestions(value.length > 1);
            }}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 100);
            }}
          />
          {showSuggestions && suggestions?.length > 0 && (
            <SuggestionDropdown
              suggestions={suggestions}
              show={showSuggestions}
              onSelect={(selected) => {
                setUsername(selected);
                setShowSuggestions(false);
                if (submittedUserName !== selected) {
                  setSubmittedUsername(selected);
                } else {
                  refetch();
                }
              }}
            />
          )}
        </div>

        <button type="submit">Search</button>
        {isLoading && <p className="status">Loading...</p>}
        {isError && <p className="status error">{error.message}</p>}
        {data && <UserCard user={data} />}
        {recentUsers.length > 0 && (
          <RecentSearches
            users={recentUsers}
            onSelect={(username) => {
              setUsername(username);
              setSubmittedUsername(username);
            }}
          />
        )}
      </form>
    </>
  );
};

export default UserSearch;
