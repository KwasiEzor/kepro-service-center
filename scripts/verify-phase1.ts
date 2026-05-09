import { api } from '../src/lib/api';

async function testPublicEndpoints() {
  console.log('🧪 Testing Public API Endpoints...');
  
  try {
    // 1. Test Quote Submission
    console.log('📡 Submitting Quote...');
    const quoteData = {
      serviceType: 'keys',
      brand: 'BMW',
      model: 'X5',
      year: '2020',
      name: 'Test Runner',
      email: 'test@example.com',
      phone: '1234567890',
      message: 'Automated Test Message',
      urgency: 'normal'
    };
    
    const quoteRes = await api.post('/api/public/quote', quoteData);
    if (quoteRes.data.success) {
      console.log('✅ Quote Submission Successful. ID:', quoteRes.data.data.id);
    } else {
      throw new Error('Quote submission failed: ' + JSON.stringify(quoteRes.data));
    }

    // 2. Test Contact Submission
    console.log('📡 Submitting Contact Message...');
    const contactData = {
      name: 'Test Runner',
      email: 'test@example.com',
      message: 'This is an automated test contact message.',
      topic: 'General Inquiry'
    };
    
    const contactRes = await api.post('/api/public/contact', contactData);
    if (contactRes.data.success) {
      console.log('✅ Contact Submission Successful. ID:', contactRes.data.data.id);
    } else {
      throw new Error('Contact submission failed: ' + JSON.stringify(contactRes.data));
    }

    console.log('🎉 All Public API Tests Passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testPublicEndpoints();
