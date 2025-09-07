import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchGithubUser } from '../api/github';
import UserCard from './user-card';
import { FaClock, FaUser } from 'react-icons/fa';

const UserSearch = () => {
  const [username, setUsername] = useState('');
  const [submittedUserName, setSubmittedUsername] = useState('');
  const [recentUsers, setRecentUsers] = useState<string[]>([]);
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
          <div className="recent-searches">
            <div className="recent-header">
              <FaClock />
              <h3>Recent Searches</h3>
            </div>
            <ul>
              {recentUsers.map((user) => (
                <li key={user}>
                  <button
                    onClick={() => {
                      setUsername(user);
                      setSubmittedUsername(user);
                    }}
                  >
                    <FaUser className="user-icon" /> {user}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </>
  );
};

export default UserSearch;
