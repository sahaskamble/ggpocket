import { checkCashInHand } from './api__structure'; // Import the function

export async function login(username, password) {
  try {
    // Your existing login logic here
    const user = await pb.authStore.login(username, password);
    
    // Check for cash_in_hand entry
    const hasCashInHand = await checkCashInHand();
    
    if (!hasCashInHand) {
      // Prompt user to enter cash_in_hand
      alert('Please enter cash in hand before proceeding.');
      // Redirect to cash in hand entry page or show a modal
      window.location.href = '/cash-in-hand-entry'; // Adjust the path as necessary
    } else {
      // Redirect to booking page
      window.location.href = '/admin/booking';
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error; // Handle error appropriately
  }
} 