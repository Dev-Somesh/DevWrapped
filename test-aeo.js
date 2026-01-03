// Quick AEO Testing Script
// Run this in browser console after loading DevWrapped

const testAEO = async () => {
  console.log('🧪 Testing AEO Implementation...');
  
  // Test 1: Check if year selection is working
  const yearAvailability = calculateYearAvailability();
  console.log('📅 Year Selection Test:', {
    currentYear: yearAvailability.currentYear,
    canShowYearSelection: yearAvailability.canShowYearSelection,
    availableYears: yearAvailability.availableYears,
    dataLimitation: yearAvailability.dataLimitation
  });
  
  // Test 2: Monitor console for AEO logs during analysis
  console.log('🔍 Watch for AEO logs during analysis:');
  console.log('- "AEO: Starting AI analysis"');
  console.log('- "AEO: AI analysis completed"');
  console.log('- Processing time metrics');
  
  // Test 3: Check network headers after analysis
  console.log('🌐 After analysis, check Network tab for:');
  console.log('- X-Processing-Time header');
  console.log('- X-AI-Model header');
  console.log('- X-Error-Type header (if errors)');
  
  return 'AEO test setup complete. Now test with a GitHub username!';
};

// Test different user types
const testUsers = {
  highActivity: ['sindresorhus', 'tj', 'addyosmani'],
  consistent: ['kentcdodds', 'wesbos', 'bradtraversy'],
  diverse: ['gaearon', 'paulirish', 'getify'],
  github: ['octocat', 'defunkt', 'mojombo']
};

const runUserTests = async (category = 'github') => {
  console.log(`🧪 Testing ${category} users:`, testUsers[category]);
  console.log('Try these usernames to test different archetype classifications');
  
  return testUsers[category];
};

// Export for easy use
window.testAEO = testAEO;
window.runUserTests = runUserTests;
window.testUsers = testUsers;

console.log('🚀 AEO Testing loaded! Run testAEO() to start');