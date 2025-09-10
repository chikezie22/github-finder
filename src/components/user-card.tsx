import { FaGithubAlt, FaUserMinus, FaUserPlus } from 'react-icons/fa';
import type { GitHubUser } from '../types';
import { checkIfFollowingUser, followGitHubUser, unFollowGitHubUser } from '../api/github';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const UserCard = ({ user }: { user: GitHubUser }) => {
  const queryClient = useQueryClient();
  const { data: isFollowing, refetch } = useQuery({
    queryKey: ['follow-status', user.login],
    queryFn: () => checkIfFollowingUser(user.login),
    enabled: !!user.login,
  });
  // mutation to follow user
  const { mutate: followMutation, isPending: followMutationIsPending } = useMutation({
    mutationFn: () => followGitHubUser(user.login),
    onSuccess: () => {
      toast.success(`you are now following ${user.login}`);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // mutation to follow user
  const { mutate: unFollowMutation, isPending: unFollowMutationIsPending } = useMutation({
    mutationFn: () => unFollowGitHubUser(user.login),
    onSuccess: () => {
      toast.success(`you are no longer following ${user.login}`);
      queryClient.invalidateQueries({
        queryKey: ['follow-status'],
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const handleFollow = () => {
    if (isFollowing) {
      // @todo unfollow
      unFollowMutation();
    } else {
      followMutation();
    }
  };
  return (
    <div className="user-card">
      <img src={user.avatar_url} alt={user.name} className="avatar" />
      <h2>{user.name || user.login}</h2>
      <p className="bio">{user.bio}</p>
      <div className="user-card-buttons">
        <button
          disabled={followMutationIsPending || unFollowMutationIsPending}
          onClick={handleFollow}
          className={`follow-btn ${isFollowing ? 'following' : ''}`}
        >
          {isFollowing ? (
            <>
              <FaUserMinus className="follow-icon" />
              Following
            </>
          ) : (
            <>
              <FaUserPlus className="follow-icon" />
              Follow User
            </>
          )}
        </button>
        <a href={user.html_url} className="profile-btn" target="_blank" rel="noopener noreferrer">
          <FaGithubAlt /> view github profile
        </a>
      </div>
    </div>
  );
};

export default UserCard;
