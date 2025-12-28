
import { GitHubStats, GitHubRepo } from '../types';

export const fetchGitHubData = async (username: string, token?: string): Promise<GitHubStats> => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const fetchWithAuth = async (url: string) => {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      // Robust Error Reporting based on status codes
      if (res.status === 401) {
        throw new Error('GITHUB_AUTH_INVALID: The provided Personal Access Token is unauthorized or has expired.');
      }
      if (res.status === 403) {
        const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
        if (rateLimitRemaining === '0') {
          throw new Error('GITHUB_RATE_LIMIT: API quota exceeded. Please use a Personal Access Token to increase your limits.');
        }
        throw new Error('GITHUB_FORBIDDEN: Access denied. This may be due to repository privacy restrictions.');
      }
      if (res.status === 404) {
        throw new Error(`GITHUB_USER_NOT_FOUND: The user profile "${username}" does not exist.`);
      }
      if (res.status >= 500) {
        throw new Error('GITHUB_SERVER_OFFLINE: GitHub services are currently experiencing high latency or downtime.');
      }
      throw new Error(`GITHUB_CORE_ERROR: Received status ${res.status} from telemetry source.`);
    }
    return res.json();
  };

  try {
    const userData = await fetchWithAuth(`https://api.github.com/users/${username}`);
    
    const commitSearch = await fetchWithAuth(
      `https://api.github.com/search/commits?q=author:${username}+committer-date:>=2024-01-01&per_page=1`
    );
    const totalCommits = commitSearch.total_count || 0;

    const reposData = await fetchWithAuth(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
    
    const langMap: Record<string, number> = {};
    const recentRepos: GitHubRepo[] = reposData.slice(0, 5).map((repo: any) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description || 'No description provided.',
      language: repo.language || 'Unknown',
      stars: repo.stargazers_count
    }));

    reposData.forEach((repo: any) => {
      if (repo.language) {
        langMap[repo.language] = (langMap[repo.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(langMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const events = await fetchWithAuth(`https://api.github.com/users/${username}/events?per_page=100`);

    const activeDaysSet = new Set<string>();
    const dates: string[] = [];
    
    events.forEach((e: any) => {
      const date = e.created_at.split('T')[0];
      activeDaysSet.add(date);
      dates.push(date);
    });

    let currentStreak = 0;
    if (dates.length > 0) {
      const sortedDates = Array.from(activeDaysSet).sort().reverse();
      let lastDate = new Date(sortedDates[0]);
      currentStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const diff = (lastDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24);
        if (diff <= 1.1) {
          currentStreak++;
          lastDate = currentDate;
        } else { break; }
      }
    }

    const activityPattern = activeDaysSet.size > 15 ? 'consistent' : 'burst';
    const monthCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      const m = new Date(e.created_at).toLocaleString('en-US', { month: 'long' });
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    });
    const mostActiveMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'October';

    const estimatedActiveDays = Math.max(activeDaysSet.size, Math.min(totalCommits, Math.floor(totalCommits / 2.5)));

    return {
      username: userData.login,
      avatarUrl: userData.avatar_url,
      profileUrl: userData.html_url,
      totalCommits,
      activeDays: estimatedActiveDays,
      topLanguages: topLanguages.length > 0 ? topLanguages : [{ name: 'Unknown', count: 0 }],
      reposContributed: userData.public_repos + (userData.total_private_repos || 0),
      recentRepos,
      streak: currentStreak,
      mostActiveMonth,
      firstActivity: '2024-01-01',
      lastActivity: dates[0] || new Date().toISOString().split('T')[0],
      activityPattern
    };
  } catch (error: any) {
    console.error("GitHub Telemetry Fault:", error);
    throw error;
  }
};
