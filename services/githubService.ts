import { GitHubStats, GitHubRepo } from '../types';

/**
 * Client-side timeout: 25s total (allows for 4 parallel calls + processing)
 * Netlify function timeout: 10s per call
 */
const CLIENT_TIMEOUT_MS = 25000;

/**
 * Calls the Netlify serverless function to proxy GitHub API calls.
 * This avoids CORS issues. No authentication required - public data only.
 */
const fetchViaProxy = async (endpoint: string, username: string, timeoutMs: number = 8000): Promise<any> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('/.netlify/functions/github-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        endpoint,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      throw new Error('GITHUB_API_TIMEOUT: Request timed out. GitHub API may be slow. Please retry.');
    }
    
    throw error;
  }
};

/**
 * Fetch all repositories for a user, handling pagination (public repos only)
 */
const fetchAllRepos = async (username: string): Promise<any[]> => {
  let allRepos: any[] = [];
  let page = 1;
  const perPage = 100;
  
  console.log(`Starting repository fetch for ${username} (public repos only)`);
  
  while (true) {
    const endpoint = `/users/${username}/repos?sort=updated&per_page=${perPage}&page=${page}`;
    console.log(`Fetching page ${page} with endpoint: ${endpoint}`);
    
    const repos = await fetchViaProxy(endpoint, username, 8000);
    
    if (!repos || repos.length === 0) {
      console.log(`No more repositories found on page ${page}`);
      break;
    }
    
    console.log(`Page ${page}: Found ${repos.length} repositories`);
    console.log(`Sample repos from page ${page}:`, repos.slice(0, 3).map((r: any) => ({ 
      name: r.name, 
      private: r.private,
      owner: r.owner.login 
    })));
    
    allRepos = allRepos.concat(repos);
    
    // If we got less than perPage results, we've reached the end
    if (repos.length < perPage) {
      console.log(`Reached end of repositories (got ${repos.length} < ${perPage})`);
      break;
    }
    
    page++;
    
    // Safety limit to prevent infinite loops
    if (page > 10) {
      console.warn('Reached maximum page limit (10) for repository fetching');
      break;
    }
  }
  
  const privateCount = allRepos.filter(r => r.private).length;
  const publicCount = allRepos.filter(r => !r.private).length;
  
  console.log(`Final repository summary:`, {
    total: allRepos.length,
    public: publicCount,
    private: privateCount,
    pages: page
  });
  
  return allRepos;
};

/**
 * Centralized contribution calculation to ensure consistency across all sections
 */
const calculateContributionStats = (events: any[], repos: any[], analysisYear: number) => {
  // Use selected year instead of current year
  const yearStart = new Date(`${analysisYear}-01-01`);
  const yearEnd = new Date(`${analysisYear}-12-31`);
  const today = new Date();
  
  // For current year, don't go beyond today
  const endDate = analysisYear === new Date().getFullYear() ? today : yearEnd;
  
  // Filter events for selected year only
  const eventsThisYear = events.filter(event => {
    const eventDate = new Date(event.created_at);
    return eventDate >= yearStart && eventDate <= endDate;
  });
  
  console.log(`Calculating stats from ${eventsThisYear.length} events in ${analysisYear}`);
  
  // Count different types of contributions consistently
  let totalContributions = 0;
  const dailyContributions = new Map<string, number>();
  const monthlyContributions = new Map<string, number>();
  const activeDaysSet = new Set<string>();
  
  eventsThisYear.forEach(event => {
    const eventDate = new Date(event.created_at);
    const dateStr = eventDate.toISOString().split('T')[0];
    const monthKey = eventDate.toISOString().slice(0, 7); // YYYY-MM
    
    activeDaysSet.add(dateStr);
    
    let contributionCount = 0;
    switch (event.type) {
      case 'PushEvent':
        // Count actual commits in push event
        contributionCount = event.payload?.commits?.length || 1;
        break;
      case 'CreateEvent':
        contributionCount = 1;
        break;
      case 'IssuesEvent':
        contributionCount = 1;
        break;
      case 'PullRequestEvent':
        contributionCount = 1;
        break;
      case 'IssueCommentEvent':
      case 'PullRequestReviewEvent':
      case 'PullRequestReviewCommentEvent':
        contributionCount = 1;
        break;
      default:
        contributionCount = 0;
    }
    
    if (contributionCount > 0) {
      totalContributions += contributionCount;
      dailyContributions.set(dateStr, (dailyContributions.get(dateStr) || 0) + contributionCount);
      monthlyContributions.set(monthKey, (monthlyContributions.get(monthKey) || 0) + contributionCount);
    }
  });
  
  // Add repository activity contributions
  repos.forEach(repo => {
    if (repo.updated_at) {
      const updateDate = new Date(repo.updated_at);
      if (updateDate >= yearStart && updateDate <= endDate) {
        const dateStr = updateDate.toISOString().split('T')[0];
        const monthKey = updateDate.toISOString().slice(0, 7);
        
        activeDaysSet.add(dateStr);
        totalContributions += 1;
        dailyContributions.set(dateStr, (dailyContributions.get(dateStr) || 0) + 1);
        monthlyContributions.set(monthKey, (monthlyContributions.get(monthKey) || 0) + 1);
      }
    }
  });
  
  // Generate monthly activity data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyActivity = [];
  
  for (let i = 0; i < 12; i++) {
    const monthKey = `${analysisYear}-${String(i + 1).padStart(2, '0')}`;
    const currentMonth = new Date(analysisYear, i, 1);
    
    if (currentMonth <= endDate) {
      const count = monthlyContributions.get(monthKey) || 0;
      
      let level = 0;
      if (count >= 1) level = 1;
      if (count >= 5) level = 2;
      if (count >= 15) level = 3;
      if (count >= 30) level = 4;
      
      monthlyActivity.push({ 
        month: months[i], 
        count, 
        level 
      });
    }
  }
  
  return {
    totalContributions,
    activeDays: activeDaysSet.size,
    dailyContributions,
    monthlyContributions,
    monthlyActivity,
    eventsThisYear: eventsThisYear.length,
    analysisYear
  };
};

/**
 * Try to get more comprehensive activity data by combining multiple sources
 * and attempting to estimate missing contributions
 */
const getEnhancedActivityData = async (username: string, analysisYear: number): Promise<any[]> => {
  try {
    // Try to get more comprehensive public activity from multiple endpoints
    const [publicEvents, receivedEvents, userRepos] = await Promise.all([
      fetchViaProxy(`/users/${username}/events/public?per_page=100`, username, 8000),
      // Try to get received events (activity on user's repos)
      fetchViaProxy(`/users/${username}/received_events/public?per_page=100`, username, 8000).catch(() => []),
      // Get user's repositories to estimate additional activity
      fetchViaProxy(`/users/${username}/repos?per_page=100&sort=updated`, username, 8000).catch(() => [])
    ]);
    
    console.log(`Enhanced activity: ${publicEvents.length} public events, ${receivedEvents.length} received events, ${userRepos.length} repos`);
    
    // Combine and deduplicate events
    const allEvents = [...publicEvents, ...receivedEvents];
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    );
    
    // Try to estimate additional contributions from repository data
    const recentRepos = userRepos.filter((repo: any) => {
      const updatedDate = new Date(repo.updated_at);
      const yearStart = new Date(`${analysisYear}-01-01`);
      const yearEnd = new Date(`${analysisYear}-12-31`);
      return updatedDate >= yearStart && updatedDate <= yearEnd;
    });
    
    // Add estimated contributions for repositories updated in selected year
    // This helps account for activity not captured in events
    const estimatedRepoContributions = recentRepos.map((repo: any) => ({
      id: `repo-${repo.id}`,
      type: 'EstimatedRepoActivity',
      created_at: repo.updated_at,
      payload: { estimated: true, repo_name: repo.name }
    }));
    
    console.log(`Added ${estimatedRepoContributions.length} estimated repo contributions`);
    
    return [...uniqueEvents, ...estimatedRepoContributions];
  } catch (error) {
    console.warn('Enhanced activity fetch failed, using basic events:', error);
    return [];
  }
};
const fetchYearEvents = async (username: string, analysisYear: number): Promise<any[]> => {
  let allEvents: any[] = [];
  let page = 1;
  const perPage = 100;
  const yearStart = new Date(`${analysisYear}-01-01`);
  const yearEnd = new Date(`${analysisYear}-12-31`);
  const today = new Date();
  
  // For current year, don't go beyond today
  const endDate = analysisYear === new Date().getFullYear() ? today : yearEnd;
  
  console.log(`Fetching public events for ${username} from ${analysisYear}-01-01 to ${endDate.toISOString().split('T')[0]}`);
  
  while (true) {
    const events = await fetchViaProxy(
      `/users/${username}/events/public?per_page=${perPage}&page=${page}`, 
      username, 
      8000
    );
    
    if (!events || events.length === 0) {
      console.log(`No more events found on page ${page}`);
      break;
    }
    
    // Filter events for selected year only
    const eventsThisYear = events.filter((event: any) => {
      const eventDate = new Date(event.created_at);
      return eventDate >= yearStart && eventDate <= endDate;
    });
    
    console.log(`Page ${page}: Found ${events.length} total events, ${eventsThisYear.length} from ${analysisYear}`);
    
    allEvents = allEvents.concat(eventsThisYear);
    
    // If we found events older than selected year, we can stop
    const oldestEventDate = new Date(events[events.length - 1].created_at);
    if (oldestEventDate < yearStart) {
      console.log(`Reached events before ${analysisYear} (${oldestEventDate.toISOString().split('T')[0]}), stopping`);
      break;
    }
    
    // If we got less than perPage results, we've reached the end
    if (events.length < perPage) {
      console.log(`Reached end of events (got ${events.length} < ${perPage})`);
      break;
    }
    
    page++;
    
    // Safety limit - GitHub public events API typically goes back ~90 days
    if (page > 30) {
      console.warn('Reached maximum page limit (30) for event fetching');
      break;
    }
  }
  
  console.log(`Fetched ${allEvents.length} public events from ${analysisYear} across ${page} pages`);
  return allEvents;
};

export const fetchGitHubData = async (username: string, selectedYear?: number): Promise<GitHubStats> => {
  const startTime = Date.now();
  const analysisYear = selectedYear || new Date().getFullYear();

  try {
    // Debug logging
    console.log('fetchGitHubData called with:', { username, analysisYear });
    
    // STEP 1: Fetch user data first
    const userData = await fetchViaProxy(`/users/${username}`, username, 5000);
    const user = userData;
    
    // STEP 2: Fetch repositories and enhanced activity data in parallel
    console.log(`Fetching public repositories and enhanced ${analysisYear} activity...`);
    const [repos, basicEvents, enhancedEvents] = await Promise.all([
      fetchAllRepos(username),
      fetchYearEvents(username, analysisYear),
      getEnhancedActivityData(username, analysisYear)
    ]);
    
    // Combine all events and remove duplicates
    const allEvents = [...basicEvents, ...enhancedEvents];
    const uniqueEvents = allEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    );
    
    const events = uniqueEvents.filter(event => {
      const eventDate = new Date(event.created_at);
      const yearStart = new Date(`${analysisYear}-01-01`);
      const yearEnd = new Date(`${analysisYear}-12-31`);
      return eventDate >= yearStart && eventDate <= yearEnd;
    });
    
    console.log(`Data fetched: ${repos.length} repos, ${events.length} unique events from ${analysisYear}`);

    // Check if we're running out of time
    if (Date.now() - startTime > CLIENT_TIMEOUT_MS - 2000) {
      throw new Error('GITHUB_FETCH_TIMEOUT: Data fetching exceeded time limit. Please retry.');
    }

    // CENTRALIZED CONTRIBUTION CALCULATION
    // This ensures all sections show the same numbers
    const contributionStats = calculateContributionStats(events, repos, analysisYear);
    
    console.log('Centralized contribution stats:', contributionStats);
    const recentRepos: GitHubRepo[] = repos.slice(0, 5).map((repo: any) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description || 'No description provided.',
      language: repo.language || 'Unknown',
      stars: repo.stargazers_count
    }));

    // Count repos created in 2024/2025
    const currentYear = new Date().getFullYear();
    const reposCreatedThisYear = repos.filter((repo: any) => {
      if (!repo.created_at) return false;
      const createdYear = new Date(repo.created_at).getFullYear();
      return createdYear === currentYear || createdYear === 2024; // Include both 2024 and current year
    }).length;

    // Calculate total stars received across all repos
    const totalStarsReceived = repos.reduce((total: number, repo: any) => {
      return total + (repo.stargazers_count || 0);
    }, 0);

    // Calculate account age in years
    const accountCreatedDate = new Date(user.created_at);
    const currentDate = new Date();
    const accountAge = Math.max(1, Math.floor((currentDate.getTime() - accountCreatedDate.getTime()) / (1000 * 60 * 60 * 24 * 365)));

    // Process repos data for language analysis
    const langMap: Record<string, number> = {};
    repos.forEach((repo: any) => {
      if (repo.language) {
        langMap[repo.language] = (langMap[repo.language] || 0) + 1;
      }
    });

    const topLanguages = Object.entries(langMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Keep all languages for tech stack cloud
    const allLanguages = Object.entries(langMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Process events data for better activity tracking
    const activeDaysSet = new Set<string>();
    const commitDates: string[] = [];
    
    // Filter for actual commit/push events and extract dates
    events.forEach((e: any) => {
      const date = e.created_at.split('T')[0];
      activeDaysSet.add(date);
      
      // Focus on commit-related events for streak calculation
      if (e.type === 'PushEvent' || e.type === 'CreateEvent') {
        commitDates.push(date);
      }
    });

    // Use centralized activity data for streak calculation
    const activeDaysArray = Array.from(contributionStats.dailyContributions.keys()).sort().reverse();

    // Enhanced streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    
    if (activeDaysSet.size > 0) {
      // Convert to sorted array of unique dates (most recent first)
      const sortedDates = Array.from(activeDaysSet).sort().reverse();
      
      // Calculate current streak (from most recent date backwards)
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Check if streak is current (today or yesterday)
      let streakStart = -1;
      if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
        streakStart = 0;
      } else if (sortedDates.includes(todayStr)) {
        streakStart = sortedDates.indexOf(todayStr);
      } else if (sortedDates.includes(yesterdayStr)) {
        streakStart = sortedDates.indexOf(yesterdayStr);
      }
      
      if (streakStart >= 0) {
        currentStreak = 1;
        let lastDate = new Date(sortedDates[streakStart]);
        
        for (let i = streakStart + 1; i < sortedDates.length; i++) {
          const currentDate = new Date(sortedDates[i]);
          const diffDays = Math.round((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak++;
            lastDate = currentDate;
          } else {
            break;
          }
        }
      }
      
      // Calculate longest streak in the data
      let tempStreak = 1;
      longestStreak = 1;
      
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currentDate = new Date(sortedDates[i]);
        const diffDays = Math.round((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }

    console.log('Streak calculation debug:', {
      totalActiveDays: activeDaysSet.size,
      currentStreak,
      longestStreak,
      recentDates: Array.from(activeDaysSet).sort().reverse().slice(0, 10)
    });

    const activityPattern = activeDaysSet.size > 15 ? 'consistent' : activeDaysSet.size > 5 ? 'burst' : 'sporadic';
    const monthCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      const m = new Date(e.created_at).toLocaleString('en-US', { month: 'long' });
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    });
    const mostActiveMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'October';

    // OPTIMIZATION: Commit search for 2025 - run it last and make it optional
    // Use a shorter timeout since we already have most data
    let totalCommits = 0;
    try {
      // Search for commits from selected year (public repos only)
      const commitSearchResult = await Promise.race([
        fetchViaProxy(
          `/search/commits?q=author:${username}+committer-date:>=${analysisYear}-01-01&per_page=1`,
          username,
          5000 // Shorter timeout - this is the slowest endpoint
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Commit search timeout')), 5000)
        ),
      ]) as any;
      
      totalCommits = commitSearchResult?.total_count || 0;
      console.log(`Found ${totalCommits} total commits in ${analysisYear} via search API`);
    } catch (commitError) {
      // Commit search failed - estimate from events data
      console.warn('Commit search timed out, using estimate from events:', commitError);
      
      // Count push events and estimate commits
      const pushEvents = events.filter((e: any) => e.type === 'PushEvent');
      totalCommits = pushEvents.reduce((total: number, event: any) => {
        return total + (event.payload?.commits?.length || 1);
      }, 0);
      
      console.log(`Estimated ${totalCommits} commits from ${pushEvents.length} push events`);
    }

    const estimatedActiveDays = Math.max(
      activeDaysSet.size, 
      Math.min(totalCommits, Math.floor(totalCommits / 3)) // More conservative estimate
    );

    console.log('Final statistics calculated:', {
      totalCommits: contributionStats.totalContributions,
      activeDays: contributionStats.activeDays,
      currentStreak,
      longestStreak,
      eventsAnalyzed: contributionStats.eventsThisYear,
      dateRange: `${contributionStats.analysisYear}-01-01 to ${new Date().toISOString().split('T')[0]}`
    });

    return {
      username: user.login,
      avatarUrl: user.avatar_url,
      profileUrl: user.html_url,
      totalCommits: contributionStats.totalContributions, // Use centralized calculation
      activeDays: contributionStats.activeDays, // Use centralized calculation
      topLanguages: topLanguages.length > 0 ? topLanguages : [{ name: 'Unknown', count: 0 }],
      allLanguages: allLanguages.length > 0 ? allLanguages : [{ name: 'Unknown', count: 0 }],
      reposContributed: user.public_repos + (user.total_private_repos || 0),
      reposCreatedThisYear,
      recentRepos,
      streak: currentStreak,
      longestStreak,
      mostActiveMonth,
      firstActivity: `${analysisYear}-01-01`,
      lastActivity: activeDaysArray[0] || new Date().toISOString().split('T')[0],
      activityPattern,
      contributionGrid: contributionStats.monthlyActivity, // Use centralized monthly data
      // New fields
      followers: user.followers || 0,
      following: user.following || 0,
      totalStarsReceived,
      accountAge,
      bio: user.bio || undefined,
      company: user.company || undefined,
      location: user.location || undefined,
      // AEO: Include analysis year for AI context
      analysisYear: analysisYear,
    };
  } catch (error: any) {
    console.error("GitHub Telemetry Fault:", error);
    throw error;
  }
};


