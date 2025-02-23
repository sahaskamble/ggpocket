import { pb } from './db';

// Base Functions
const handleError = (error) => {
  console.error('API Error:', error);
  throw new Error(error.message);
};

// API Functions for Session
export async function fetchSessions(page = 1, perPage = 50) {
  try {
    return await pb.collection('sessions').getList(page, perPage, {
      sort: '-created',
      expand: 'customer_id,device_id,game_id,snack_id,branch_id,user_id',
      filter: pb.filter('status != "deleted"')
    });
  } catch (error) {
    handleError(error);
  }
}

export async function addSession(sessionData) {
  try {
    const existingSession = await pb.collection('sessions').getFirstListItem(
      pb.filter('device_id = {:device} && status = "active"', {
        device: sessionData.device_id
      })
    ).catch(() => null);

    if (existingSession) {
      throw new Error('Device already has an active session');
    }

    // Validate required fields based on schema
    const newSession = {
      customer_id: sessionData.customer_id,
      device_id: sessionData.device_id,
      game_id: sessionData.game_id,
      no_of_players: sessionData.no_of_players,
      session_in: new Date().toISOString(),
      duration_hours: sessionData.duration_hours || 1,
      snack_id: sessionData.snack_id || null,
      total_amount: sessionData.total_amount,
      reward_points_earned: sessionData.reward_points_earned || 0,
      branch_id: sessionData.branch_id,
      status: 'active',
      user_id: pb.authStore.record.id
    };

    return await pb.collection('sessions').create(newSession);
  } catch (error) {
    handleError(error);
  }
}

export async function extendSession(id, duration_hours) {
  try {
    const session = await pb.collection('sessions').getOne(id);
    return await pb.collection('sessions').update(id, {
      duration_hours: session.duration_hours + duration_hours,
      status: 'extended'
    });
  } catch (error) {
    handleError(error);
  }
}

export async function endSession(id) {
  try {
    const session = await pb.collection('sessions').getOne(id);
    const sessionOut = new Date().toISOString();

    // Calculate actual duration
    const startTime = new Date(session.session_in);
    const endTime = new Date(sessionOut);
    const actualDuration = (endTime - startTime) / (1000 * 60 * 60); // Convert to hours

    return await pb.collection('sessions').update(id, {
      session_out: sessionOut,
      duration_hours: actualDuration,
      status: 'closed'
    });
  } catch (error) {
    handleError(error);
  }
}

// API Functions For Managing Staff 
export async function fetchStaff(page = 1, perPage = 50) {
  try {
    return await pb.collection('users').getList(page, perPage, {
      filter: pb.filter('role != {:role}', { role: 'SuperAdmin' }),
      sort: '-created',
      expand: 'role,branch_id'
    });
  } catch (error) {
    handleError(error);
  }
}

export async function addStaff(staffData) {
  try {
    return await pb.collection('users').create(staffData);
  } catch (error) {
    handleError(error);
  }
}

export async function editStaffById(id, data) {
  try {
    return await pb.collection('users').update(id, data);
  } catch (error) {
    handleError(error);
  }
}

export async function readStaffById(id) {
  try {
    return await pb.collection('users').getOne(id);
  } catch (error) {
    handleError(error);
  }
}

export async function deleteStaff(id) {
  try {
    return await pb.collection('users').delete(id);
  } catch (error) {
    handleError(error);
  }
}

// API Functions For Managing Inventory
export async function fetchInventory(page = 1, perPage = 50, type = null) {
  try {
    const filter = type
      ? pb.filter('type = {:type}', { type })
      : '';

    return await pb.collection('inventory').getList(page, perPage, {
      sort: '-created',
      expand: 'branch_id',
      filter
    });
  } catch (error) {
    handleError(error);
  }
}

export async function addInventory(inventoryData) {
  try {
    const newInventory = {
      name: inventoryData.name,
      type: inventoryData.type, // device, game, or snack
      category: inventoryData.category,
      stock: inventoryData.stock || 1,
      branch_id: inventoryData.branch_id,
      popularity_score: inventoryData.popularity_score || 0,
      avatar: inventoryData.avatar,
      status: inventoryData.status || 'open'
    };

    return await pb.collection('inventory').create(newInventory);
  } catch (error) {
    handleError(error);
  }
}

export async function editInventoryById(id, data) {
  try {
    return await pb.collection('inventory').update(id, data);
  } catch (error) {
    handleError(error);
  }
}

export async function readInventoryById(id) {
  try {
    return await pb.collection('inventory').getOne(id);
  } catch (error) {
    handleError(error);
  }
}

export async function deleteInventoryById(id) {
  try {
    return await pb.collection('inventory').delete(id);
  } catch (error) {
    handleError(error);
  }
}

// API Functions For Managing CRM and CRM Reports
export async function fetchCrm(page = 1, perPage = 50) {
  try {
    return await pb.collection('customers').getList(page, perPage, {
      sort: '-created',
      expand: 'branch_id,user_id',
      filter: pb.filter('total_visits > 0')
    });
  } catch (error) {
    handleError(error);
  }
}

export async function addCrm(customerData) {
  try {
    const newCustomer = {
      customer_name: customerData.customer_name,
      customer_contact: customerData.customer_contact,
      total_visits: 1,
      total_rewards: customerData.total_rewards || 0,
      branch_id: customerData.branch_id,
      user_id: pb.authStore.record.id
    };

    return await pb.collection('customers').create(newCustomer);
  } catch (error) {
    handleError(error);
  }
}

export async function editCrmById(id, data) {
  try {
    return await pb.collection('customers').update(id, data);
  } catch (error) {
    handleError(error);
  }
}

export async function readCrmById(id) {
  try {
    return await pb.collection('customers').getOne(id, {
      expand: 'branch_id'
    });
  } catch (error) {
    handleError(error);
  }
}

export async function deleteCrmById(id) {
  try {
    return await pb.collection('customers').delete(id);
  } catch (error) {
    handleError(error);
  }
}

// API Functions For Managing Cash logs 
export async function fetchCashLog() {
  try {
    return await pb.collection('cashlog').getList(1, 50, {
      expand: 'branch_id'
    });
  } catch (error) {
    handleError(error);
  }
}

export async function addCashLog(logData) {
  try {
    return await pb.collection('sessions').create({
      ...logData,
      user_id: pb.authStore.record.id
    });
  } catch (error) {
    handleError(error);
  }
}

export async function editCashLogById(id, data) {
  try {
    return await pb.collection('sessions').update(id, data);
  } catch (error) {
    handleError(error);
  }
}

export async function readCashLogById(id) {
  try {
    return await pb.collection('sessions').getOne(id, {
      expand: 'customer_id,branch_id'
    });
  } catch (error) {
    handleError(error);
  }
}

export async function deleteCashLogById(id) {
  try {
    return await pb.collection('sessions').delete(id);
  } catch (error) {
    handleError(error);
  }
}

// API Functions For Fetching Dashboard Data
export async function readDashboardCurrent() {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [sessions, inventory, customers, revenue] = await Promise.all([
      pb.collection('sessions').getList(1, 1, {
        filter: pb.filter('created >= {:date}', { date: today })
      }),
      pb.collection('inventory').getList(1, 50, {
        filter: pb.filter('type = "device"')
      }),
      pb.collection('customers').getList(1, 1, {
        filter: pb.filter('created >= {:date}', { date: today })
      }),
      pb.collection('sessions').getList(1, 100, {
        filter: pb.filter('created >= {:date} && status = "closed"', {
          date: today
        })
      })
    ]);

    return {
      todaySessions: sessions.totalItems,
      activeDevices: inventory.items.filter(item => item.status === 'active').length,
      totalDevices: inventory.items.length,
      newCustomers: customers.totalItems,
      todayRevenue: revenue.items.reduce((acc, session) => acc + (session.total_amount || 0), 0),
      totalRewards: revenue.items.reduce((acc, session) => acc + (session.reward_points_earned || 0), 0)
    };
  } catch (error) {
    handleError(error);
  }
}

export async function readDashboardByDates(startDate, endDate) {
  try {
    const [sessions, customers] = await Promise.all([
      pb.collection('sessions').getList(1, 1, {
        filter: `created >= "${startDate}" && created <= "${endDate}"`,
        sort: '-created'
      }),
      pb.collection('customers').getList(1, 1, {
        filter: `created >= "${startDate}" && created <= "${endDate}"`,
        sort: '-created'
      })
    ]);

    return {
      totalSessions: sessions.totalItems,
      newCustomers: customers.totalItems
    };
  } catch (error) {
    handleError(error);
  }
}

/* // API Functions For Fetching Expenses Data
export async function readExpensesCurrent() {
  // Implement when expenses collection is added to schema
  throw new Error('Not implemented');
}

export async function readExpensesByDates(startDate, endDate) {
  // Implement when expenses collection is added to schema
  throw new Error('Not d');
} */

// Add these new functions

export async function fetchStaffLogins(page = 1, perPage = 50) {
  try {
    return await pb.collection('staff_logins').getList(page, perPage, {
      sort: '-login_time',
      expand: 'user_id,branch_id',
      filter: pb.filter('status = "active"')
    });
  } catch (error) {
    handleError(error);
  }
}

export async function getStaffLoginHistory(userId, startDate, endDate) {
  try {
    return await pb.collection('staff_logins').getList(1, 100, {
      sort: '-login_time',
      expand: 'branch_id',
      filter: pb.filter('user_id = {:user} && login_time >= {:start} && login_time <= {:end}', {
        user: userId,
        start: startDate,
        end: endDate
      })
    });
  } catch (error) {
    handleError(error);
  }
}

export async function getCurrentBranchStaff() {
  try {
    const activeLogins = await pb.collection('staff_logins').getList(1, 50, {
      expand: 'user_id,branch_id',
      filter: pb.filter('status = "active"')
    });

    return activeLogins.items.reduce((acc, login) => {
      const branchId = login.expand?.branch_id?.id;
      if (!acc[branchId]) {
        acc[branchId] = [];
      }
      acc[branchId].push(login.expand?.user_id);
      return acc;
    }, {});
  } catch (error) {
    handleError(error);
  }
}

export async function getGamePlayStats() {
  try {
    const sessions = await pb.collection('sessions').getList(1, 1000, {
      expand: 'game_id',
      filter: pb.filter('status != "deleted"')
    });

    const gameStats = {};

    sessions.items.forEach(session => {
      if (session.game_id && session.expand?.game_id) {
        const gameId = session.game_id;
        if (!gameStats[gameId]) {
          gameStats[gameId] = {
            name: session.expand.game_id.name || 'Unknown Game',
            plays: 0
          };
        }
        gameStats[gameId].plays += 1;
      }
    });

    const sortedStats = Object.values(gameStats)
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10); // Get top 10 games

    return sortedStats.length > 0 ? sortedStats : [{ name: 'No Data', plays: 0 }];
  } catch (error) {
    console.error('Error fetching game stats:', error);
    return [{ name: 'No Data', plays: 0 }];
  }
}

export async function getPeakHours() {
  try {
    const sessions = await pb.collection('sessions').getList(1, 1000, {
      filter: pb.filter('created >= {:start}', {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    });

    // Initialize hourly stats with proper structure
    const hourlyStats = Array.from({ length: 24 }, (_, index) => ({
      hour: index,
      sessions: 0
    }));

    // Count sessions for each hour
    sessions.items.forEach(session => {
      try {
        const sessionDate = new Date(session.session_in);
        if (sessionDate && !isNaN(sessionDate)) {
          const hour = sessionDate.getHours();
          if (hour >= 0 && hour < 24) {
            hourlyStats[hour].sessions += 1;
          }
        }
      } catch (error) {
        console.error('Error processing session date:', error);
      }
    });

    return hourlyStats;
  } catch (error) {
    console.error('Error fetching peak hours:', error);
    // Return empty data structure if there's an error
    return Array.from({ length: 24 }, (_, index) => ({
      hour: index,
      sessions: 0
    }));
  }
}

// Add these functions after the existing staff management functions

export async function registerStaff(staffData) {
  try {
    // First create the user account
    const userData = {
      username: staffData.username,
      email: staffData.email,
      password: staffData.password,
      passwordConfirm: staffData.passwordConfirm,
      name: staffData.name,
      role: staffData.role || 'Staff',
      branch_id: staffData.branch_id,
      avatar: staffData.avatar || null,
      status: 'active'
    };

    const record = await pb.collection('users').create(userData);

    // Return the created user without sensitive data
    const { password, passwordConfirm, ...safeRecord } = record;
    return safeRecord;
  } catch (error) {
    handleError(error);
  }
}

export async function updateStaffAccount(id, staffData) {
  try {
    const updateData = {
      username: staffData.username,
      email: staffData.email,
      name: staffData.name,
      role: staffData.role,
      branch_id: staffData.branch_id,
      avatar: staffData.avatar,
      status: staffData.status
    };

    // If password is provided, include it in the update
    if (staffData.password && staffData.passwordConfirm) {
      updateData.password = staffData.password;
      updateData.passwordConfirm = staffData.passwordConfirm;
    }

    const record = await pb.collection('users').update(id, updateData);

    // Return the updated user without sensitive data
    const { password, passwordConfirm, ...safeRecord } = record;
    return safeRecord;
  } catch (error) {
    handleError(error);
  }
}

// Update the getPaymentStats function
export async function getPaymentStats() {
  try {
    const sessions = await pb.collection('sessions').getList(1, 1000, {
      filter: pb.filter('created >= {:start}', {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Last 24 hours
      })
    });

    // Initialize with our two payment modes
    const paymentStats = {
      'CASH': { count: 0, total: 0 },
      'UPI': { count: 0, total: 0 }
    };

    // Process sessions
    sessions.items.forEach(session => {
      // Normalize the payment mode to uppercase and handle null/undefined
      const rawMode = (session.payment_mode || 'CASH').toUpperCase().trim();

      // Map any variations to our standard modes
      let mode = 'CASH'; // default
      if (rawMode.includes('UPI')) {
        mode = 'UPI';
      }

      // Update stats
      paymentStats[mode].count += 1;
      paymentStats[mode].total += session.total_amount || 0;
    });

    const totalTransactions = Object.values(paymentStats).reduce((sum, stat) => sum + stat.count, 0);

    // Format the results
    return Object.entries(paymentStats).map(([mode, stats]) => ({
      mode: mode === 'UPI' ? 'UPI' : 'Cash', // Format for display
      percentage: totalTransactions ? ((stats.count / totalTransactions) * 100).toFixed(1) : 0,
      amount: stats.total,
      count: stats.count
    }));
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return [];
  }
}

// Add these functions for reports
export async function getReportData(startDate, endDate) {
  try {
    // Fetch sessions data
    const sessions = await pb.collection('sessions').getList(1, 1000, {
      filter: `created >= '${startDate}' && created <= '${endDate}'`,
      expand: 'customer_id,game_id,user_id'
    });

    // Fetch staff data
    const staff = await pb.collection('users').getList(1, 1000, {
      filter: 'role != "SuperAdmin"'
    });

    // Fetch staff logins
    const staffLogins = await pb.collection('staff_logins').getList(1, 1000, {
      filter: `login_time >= '${startDate}' && login_time <= '${endDate}'`,
      expand: 'user_id,branch_id'
    });

    // Calculate metrics
    const metrics = {
      // Revenue metrics
      totalRevenue: sessions.items.reduce((sum, session) => sum + (session.total_amount || 0), 0),
      cashRevenue: sessions.items
        .filter(s => s.payment_mode === 'CASH')
        .reduce((sum, session) => sum + (session.total_amount || 0), 0),
      upiRevenue: sessions.items
        .filter(s => s.payment_mode === 'UPI')
        .reduce((sum, session) => sum + (session.total_amount || 0), 0),

      // Session metrics
      totalSessions: sessions.items.length,
      activeSessions: sessions.items.filter(s => s.status === 'active').length,
      avgSessionDuration: calculateAverageSessionDuration(sessions.items),

      // Staff metrics
      totalStaff: staff.items.length,
      activeStaff: staff.items.filter(s => s.status === 'active').length,
      staffPerformance: calculateStaffPerformance(sessions.items, staff.items),

      // Customer metrics
      uniqueCustomers: new Set(sessions.items.map(s => s.customer_id)).size,
      customerSegments: calculateCustomerSegments(sessions.items),
      popularGames: calculatePopularGames(sessions.items),
    };

    return {
      metrics,
      sessions: sessions.items,
      staff: staff.items,
      staffLogins: staffLogins.items
    };
  } catch (error) {
    console.error('Error fetching report data:', error);
    throw error;
  }
}

// Helper functions
function calculateAverageSessionDuration(sessions) {
  const durations = sessions.map(s => s.duration_hours || 0);
  return durations.length ?
    durations.reduce((sum, duration) => sum + duration, 0) / durations.length : 0;
}

function calculateStaffPerformance(sessions, staff) {
  const performance = {};
  staff.forEach(member => {
    const staffSessions = sessions.filter(s => s.user_id === member.id);
    performance[member.id] = {
      totalSessions: staffSessions.length,
      revenue: staffSessions.reduce((sum, s) => sum + (s.total_amount || 0), 0),
      avgRating: 4.5, // You might want to add a rating system
    };
  });
  return performance;
}

function calculateCustomerSegments(sessions) {
  const customerVisits = {};
  sessions.forEach(session => {
    customerVisits[session.customer_id] = (customerVisits[session.customer_id] || 0) + 1;
  });

  const segments = {
    VIP: 0,      // >10 visits
    Regular: 0,   // 5-10 visits
    Occasional: 0, // 2-4 visits
    New: 0        // 1 visit
  };

  Object.values(customerVisits).forEach(visits => {
    if (visits > 10) segments.VIP++;
    else if (visits >= 5) segments.Regular++;
    else if (visits >= 2) segments.Occasional++;
    else segments.New++;
  });

  return Object.entries(segments).map(([name, value]) => ({
    name,
    value,
    color: `hsl(var(--chart-${Object.keys(segments).indexOf(name) + 1}))`
  }));
}

function calculatePopularGames(sessions) {
  const gameStats = {};
  sessions.forEach(session => {
    if (!session.expand?.game_id?.name) return;
    const gameName = session.expand.game_id.name;
    gameStats[gameName] = (gameStats[gameName] || 0) + 1;
  });

  return Object.entries(gameStats)
    .map(([name, plays]) => ({
      name,
      plays,
      color: `hsl(var(--chart-${Object.keys(gameStats).indexOf(name) % 5 + 1}))`
    }))
    .sort((a, b) => b.plays - a.plays);
}

export async function getPricingData() {
  try {
    const response = await pb.collection('pricing').getList(1, 1);
    return {
      single: response.items[0].single_price,
      multiplayer: response.items[0].multiplayer_price,
      overThree: response.items[0].over_three_price,
    };
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    throw error;
  }
}

export async function fetchPricings({ branch_id = '' }) {
  try {
    const response = await pb.collection('pricing').getList(1, 50, {
      filter: `branch_id= "${branch_id}"`
    });

    return response;
  } catch (error) {
    console.log(error);
  }
}

// Add this function to check cash_in_hand
export async function checkCashInHand() {
  const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  try {
    const cashEntries = await pb.collection('cash_in_hand').getList(1, 50, {
      filter: `date = '${today}'` // Assuming 'date' is the field name in your cash_in_hand collection
    });
    return cashEntries.totalItems > 0; // Return true if there are entries
  } catch (error) {
    console.error('Error fetching cash in hand:', error);
    throw error;
  }
}

export async function addCashInHand(cashData) {
  try {
    return await pb.collection('cash_in_hand').create(cashData);
  } catch (error) {
    console.error('Error adding cash in hand:', error);
    throw error;
  }
}

export async function fetchCustomers(name) {
  try {
    const response = await pb.collection('customers').getList(1, 50, {
      filter: `customer_name = '${name}'` // Adjust the filter as needed
    });
    return response.items; // Return the list of customers
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error; // Handle error appropriately
  }
}

// Fetch snacks from the database
export async function fetchSnacks() {
  try {
    const response = await pb.collection('snacks').getList(1, 50); // Adjust pagination as needed
    return response.items; // Return the list of snacks
  } catch (error) {
    console.error('Error fetching snacks:', error);
    throw error; // Handle error appropriately
  }
}
