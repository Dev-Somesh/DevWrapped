// services/mixpanelService.ts
import mixpanel from 'mixpanel-browser';

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    mixpanel.track(eventName, properties);
  } catch (error) {
    console.warn('Mixpanel tracking error:', error);
  }
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  try {
    mixpanel.identify(userId);
    if (properties) {
      mixpanel.people.set(properties);
    }
  } catch (error) {
    console.warn('Mixpanel identify error:', error);
  }
};

// Advanced tracking utilities
export const trackTimeOnPage = (startTime: number, pageName: string, additionalProps?: Record<string, any>) => {
  const timeSpent = Math.round((Date.now() - startTime) / 1000); // in seconds
  trackEvent('Time on Page', {
    page_name: pageName,
    time_spent_seconds: timeSpent,
    time_spent_minutes: Math.round(timeSpent / 60 * 10) / 10, // rounded to 1 decimal
    ...additionalProps
  });
};

export const trackScrollDepth = (scrollPercentage: number, pageName: string, additionalProps?: Record<string, any>) => {
  // Only track at certain milestones to avoid spam
  const milestones = [25, 50, 75, 90, 100];
  const milestone = milestones.find(m => scrollPercentage >= m && scrollPercentage < m + 5);
  
  if (milestone) {
    trackEvent('Scroll Depth', {
      page_name: pageName,
      scroll_percentage: milestone,
      ...additionalProps
    });
  }
};

export const trackFeatureEngagement = (featureName: string, action: string, additionalProps?: Record<string, any>) => {
  trackEvent('Feature Engagement', {
    feature_name: featureName,
    action: action,
    timestamp: new Date().toISOString(),
    ...additionalProps
  });
};

// Session tracking
export const trackSessionStart = () => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('devwrapped_session_id', sessionId);
  sessionStorage.setItem('devwrapped_session_start', Date.now().toString());
  
  trackEvent('Session Started', {
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    page_url: window.location.href,
    referrer: document.referrer || 'direct',
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport_size: `${window.innerWidth}x${window.innerHeight}`
  });
  
  return sessionId;
};

export const trackSessionEnd = (additionalProps?: Record<string, any>) => {
  const sessionId = sessionStorage.getItem('devwrapped_session_id');
  const sessionStart = sessionStorage.getItem('devwrapped_session_start');
  
  if (sessionId && sessionStart) {
    const sessionDuration = Math.round((Date.now() - parseInt(sessionStart)) / 1000);
    
    trackEvent('Session Ended', {
      session_id: sessionId,
      session_duration_seconds: sessionDuration,
      session_duration_minutes: Math.round(sessionDuration / 60 * 10) / 10,
      timestamp: new Date().toISOString(),
      ...additionalProps
    });
  }
};