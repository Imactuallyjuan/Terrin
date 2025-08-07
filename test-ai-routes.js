#!/usr/bin/env node

// Simple test script for AI routes  
async function testAI() {
  // Use node's built-in fetch (Node 18+)
  const fetch = globalThis.fetch;

  const baseUrl = 'http://localhost:5000';

  console.log('🧪 Testing AI Routes...\n');

  try {
    // Test 1: Basic AI chat completion
    console.log('1️⃣ Testing basic AI chat completion...');
    const response1 = await fetch(`${baseUrl}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: 'You are a helpful construction expert.',
        userPrompt: 'What are the key considerations for a kitchen renovation?'
      })
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Basic AI route working!');
      console.log(`📝 Response: ${data1.data.content.substring(0, 100)}...\n`);
    } else {
      console.log(`❌ Basic AI route failed: ${response1.status}`);
    }

    // Test 2: Project scope generation
    console.log('2️⃣ Testing project scope generation...');
    const response2 = await fetch(`${baseUrl}/api/ai/project-scope`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectDescription: 'Modern kitchen renovation with new cabinets, countertops, and appliances'
      })
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Project scope route working!');
      console.log(`📝 Response: ${data2.data.content.substring(0, 100)}...\n`);
    } else {
      console.log(`❌ Project scope route failed: ${response2.status}`);
    }

    // Test 3: Cost estimate generation
    console.log('3️⃣ Testing cost estimate generation...');
    const response3 = await fetch(`${baseUrl}/api/ai/cost-estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectDescription: 'Bathroom renovation with new tiles and fixtures',
        location: 'San Francisco, CA'
      })
    });
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ Cost estimate route working!');
      console.log(`📝 Response: ${data3.data.content.substring(0, 100)}...\n`);
    } else {
      console.log(`❌ Cost estimate route failed: ${response3.status}`);
    }

    console.log('🎉 AI routes testing complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAI();