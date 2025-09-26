// Simple test of restaurant service
import { restaurantService } from './src/services/restaurantService.js';

async function testRestaurantService() {
  try {
    console.log('Testing restaurant service...');
    const result = await restaurantService.searchRestaurants({ query: 'mario', limit: 3 });
    console.log('Search result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testRestaurantService();