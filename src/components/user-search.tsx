import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { fetchGithubUser } from '../api/github';
import UserCard from './user-card';

import RecentSearches from './recent-searches';

const UserSearch = () => {
  const [username, setUsername] = useState('');
  const [submittedUserName, setSubmittedUsername] = useState('');
  const [recentUsers, setRecentUsers] = useState<string[]>(() => {
    const stored = localStorage.getItem('recent');
    return stored ? JSON.parse(stored) : [];
  });
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', submittedUserName],
    queryFn: () => fetchGithubUser(submittedUserName),
    enabled: !!submittedUserName,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    setSubmittedUsername(trimmed);
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
        <input
          type="text"
          placeholder="Enter Github Username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
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
