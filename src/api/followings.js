const GATEWAY = 'http://localhost:8000';

function authHeaders() {
  const token = sessionStorage.getItem('jwtToken') || '';
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  };
}

export async function recommend(userId, limit = 6) {
  const url = `${GATEWAY}/api/users/${encodeURIComponent(userId)}/recommendations?limit=${limit}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).message || `HTTP ${res.status}`);
  return res.json();
}

export async function getFollowers(userId, limit = 20, offset = 0) {
  const url = `${GATEWAY}/api/users/${encodeURIComponent(userId)}/followers?limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error((await res.json()).message || `HTTP ${res.status}`);
  return res.json();
}

export async function getFollowing(userId, limit = 20, offset = 0) {
  const url = `${GATEWAY}/api/users/${encodeURIComponent(userId)}/following?limit=${limit}&offset=${offset}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error((await res.json()).message || `HTTP ${res.status}`);
  return res.json();
}

export async function follow(followerId, followeeId) {
  const url = `${GATEWAY}/api/follow`;
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ follower_id: followerId, followee_id: followeeId })
  });
  if (!res.ok) throw new Error((await res.json()).message || `HTTP ${res.status}`);
  return res.json();
}

export async function unfollow(followerId, followeeId) {
  const url = `${GATEWAY}/api/follow`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ follower_id: followerId, followee_id: followeeId })
  });
  if (!res.ok) throw new Error((await res.json()).message || `HTTP ${res.status}`);
  return res.json();
}

export async function isFollowing(followerId, followeeId) {
  const url = `${GATEWAY}/api/users/${encodeURIComponent(followerId)}/is-following/${encodeURIComponent(followeeId)}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error((await res.json()).message || `HTTP ${res.status}`);
  return res.json();
}