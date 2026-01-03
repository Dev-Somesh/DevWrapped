# 🧪 DevWrapped AEO Testing Guide

## 🎯 Testing the AEO Implementation

### 1. **Local Development Testing**

#### **Setup**
```bash
# 1. Start the development server
npm run dev

# 2. Or start with Netlify functions (recommended for AEO testing)
npm run dev:netlify
```

#### **Test Cases for AEO**

##### **A. Year Selection Testing**
1. **Current Year (2026) - Should show year selection**
   - Input: Any GitHub username
   - Expected: Year selection dropdown with 2025 and 2026 options
   - Expected: Data limitation warning about 90-day API limit

2. **Test Different Scenarios**
   ```bash
   # Test with active users
   - "octocat" (GitHub's mascot account)
   - "torvalds" (Linus Torvalds)
   - "gaearon" (Dan Abramov)
   - Your own GitHub username
   ```

##### **B. AEO Quality Testing**
1. **Archetype Accuracy**
   - Test with users who have different activity patterns
   - Check if archetype matches their actual behavior
   - Verify confidence scores are reasonable (0.7-1.0)

2. **Narrative Quality**
   - Check if narratives reference specific metrics
   - Verify year-specific context (2025 vs 2026)
   - Ensure forward-looking insights are actionable

3. **Performance Monitoring**
   - Open browser DevTools → Console
   - Look for AEO logs:
   ```
   AEO: Starting AI analysis {username, model, totalCommits, activeDays, analysisYear}
   AEO: AI analysis completed {processingTime, archetype, model}
   ```

### 2. **Browser Console Testing**

#### **Enable Debug Mode**
```javascript
// In browser console, enable detailed logging
localStorage.setItem('debug', 'true');

// Then refresh and test - you'll see detailed AEO logs
```

#### **Check AEO Performance Headers**
```javascript
// After analysis completes, check network tab
// Look for gemini-proxy response headers:
// X-Processing-Time: 2340
// X-AI-Model: gemini-3-flash-preview
```

### 3. **Quality Validation Tests**

#### **A. Test Different User Types**
```bash
# High-activity users (should get "The Builder" or "The Architect")
- "sindresorhus" (prolific open source contributor)
- "tj" (TJ Holowaychuk)

# Diverse language users (should get "The Explorer")
- "addyosmani" (Addy Osmani)
- "paulirish" (Paul Irish)

# Consistent contributors (should get "The Maintainer")
- "kentcdodds" (Kent C. Dodds)
- "wesbos" (Wes Bos)
```

#### **B. Verify AEO Features**
1. **Dynamic Prompting**: Check if AI mentions the correct year (2025/2026)
2. **Enhanced Context**: Look for references to specific repos, languages, stats
3. **Archetype Logic**: Verify archetype matches user's actual patterns
4. **Forward-Looking**: Check if recommendations are personalized

### 4. **Error Handling Testing**

#### **A. Test Invalid Inputs**
```bash
# These should trigger specific error messages
- "nonexistentuser12345" (404 error)
- "" (validation error)
- "user-with-no-activity" (no data error)
```

#### **B. Test API Limits**
```bash
# Test rate limiting (after 60 requests in an hour)
# Should show: "GitHub API rate limit reached"
```

### 5. **Mobile Testing**

#### **A. Year Selection on Mobile**
- Test year selection UI on different screen sizes
- Verify disclaimers are readable
- Check touch targets are adequate (44px minimum)

#### **B. Performance on Mobile**
- Test on actual mobile devices
- Check processing times (should be under 10 seconds)
- Verify export functionality works

### 6. **Production Testing (Netlify)**

#### **A. Deploy and Test**
```bash
# Deploy to Netlify
npm run build
netlify deploy --prod

# Test with real API keys
# Check Netlify function logs for AEO metrics
```

#### **B. Monitor Performance**
- Check Netlify function execution times
- Monitor error rates in Netlify dashboard
- Verify environment variables are set correctly

## 🔍 What to Look For

### ✅ **AEO Working Correctly**
- [ ] Year selection appears when appropriate
- [ ] AI mentions correct year in narrative
- [ ] Archetype feels accurate for the user
- [ ] Processing time under 10 seconds
- [ ] Console shows AEO performance logs
- [ ] Forward-looking insights are specific
- [ ] Error messages are user-friendly

### ❌ **AEO Issues to Watch**
- [ ] Generic archetypes (not data-driven)
- [ ] Wrong year mentioned in narrative
- [ ] Processing time over 15 seconds
- [ ] Missing confidence scores
- [ ] Generic recommendations
- [ ] Console errors or warnings

## 🚀 Advanced Testing

### **A. Load Testing**
```javascript
// Test multiple users rapidly (be careful of rate limits)
const testUsers = ['octocat', 'torvalds', 'gaearon', 'sindresorhus'];
const results = [];

for (const user of testUsers) {
  const start = Date.now();
  try {
    const result = await analyzeUser(user);
    results.push({
      user,
      success: true,
      time: Date.now() - start,
      archetype: result.archetype
    });
  } catch (error) {
    results.push({
      user,
      success: false,
      error: error.message
    });
  }
}

console.table(results);
```

### **B. A/B Testing Different Models**
```javascript
// Test both Gemini models
const testBothModels = async (username) => {
  const flashResult = await testWithModel(username, 'gemini-3-flash-preview');
  const liteResult = await testWithModel(username, 'gemini-3-flash-lite');
  
  console.log('Flash vs Lite comparison:', {
    flash: { archetype: flashResult.archetype, time: flashResult.processingTime },
    lite: { archetype: liteResult.archetype, time: liteResult.processingTime }
  });
};
```

## 📊 Success Metrics

### **AEO Performance Targets**
- **Processing Time**: < 10 seconds average
- **Archetype Accuracy**: > 80% feel appropriate
- **Error Rate**: < 5% of requests
- **User Satisfaction**: Narratives feel personal and accurate

### **Quality Indicators**
- AI mentions specific numbers from user's GitHub
- Archetype explanation includes concrete evidence
- Recommendations are actionable and relevant
- Year context is accurate throughout

## 🐛 Common Issues & Solutions

### **Issue: Generic Archetypes**
```
Problem: AI returns "The Developer" or generic personas
Solution: Check if user has sufficient 2025/2026 activity
```

### **Issue: Wrong Year Context**
```
Problem: AI mentions 2024 instead of selected year
Solution: Verify analysisYear is passed correctly to AI service
```

### **Issue: Slow Performance**
```
Problem: Processing takes > 15 seconds
Solution: Check Netlify function timeout settings and API quotas
```

### **Issue: Missing Data**
```
Problem: AI narrative lacks specific details
Solution: Verify GitHub data fetching is working correctly
```

## 📈 Monitoring in Production

### **Netlify Function Logs**
```bash
# Check function execution logs
netlify functions:log gemini-proxy

# Look for AEO performance metrics:
# "AEO: Starting AI analysis"
# "AEO: AI analysis completed"
```

### **User Feedback Indicators**
- Users sharing results on social media
- Positive comments about accuracy
- Low error reports
- High export/share rates

## 🎯 Testing Checklist

- [ ] Year selection works correctly
- [ ] AEO logs appear in console
- [ ] Archetypes feel accurate
- [ ] Narratives mention specific data
- [ ] Processing time is reasonable
- [ ] Error handling is graceful
- [ ] Mobile experience is smooth
- [ ] Export functionality works
- [ ] Performance headers are present
- [ ] Forward-looking insights are actionable