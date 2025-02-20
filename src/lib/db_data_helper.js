import pb from './db';

export async function getDashboardStats(branchId, dateRange = 'all') {
    try {
        const now = new Date();
        let startDate = new Date();
        pb.autoCancellation(false);

        // Calculate start date based on selected range
        switch (dateRange) {
            case '1week':
                startDate.setDate(now.getDate() - 7);
                break;
            case '1month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '3months':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case '6months':
                startDate.setMonth(now.getMonth() - 6);
                break;
            case '1year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate = new Date(0); // Beginning of time for 'all'
        }

        // Format dates for PocketBase query
        const formattedStartDate = startDate.toISOString();
        const formattedEndDate = now.toISOString();

        // Fetch sessions within date range
        const sessionsData = await pb.collection('sessions').getList(1, 200, {
            filter: `branch_id = "${branchId}" && created >= "${formattedStartDate}" && created <= "${formattedEndDate}"`,
            expand: 'user_id'
        });

        // Calculate total revenue for the date range
        const totalRevenue = sessionsData.items.reduce((acc, session) => {
            return acc + (session.total_amount || 0);
        }, 0);

        // Count sessions for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySessions = sessionsData.items.filter(session =>
            new Date(session.created).getTime() >= today.getTime()
        ).length;

        // Get active sessions (not ended yet)
        const activeSessions = await pb.collection('sessions').getList(1, 50, {
            filter: `branch_id = "${branchId}" && status = "occupied"`,
            expand: 'user_id'
        });

        // Get active users
        const activeUsers = await pb.collection('users').getList(1, 50, {
            filter: `branch_id ~ "${branchId}"`,
        });

        // Get period comparison
        const previousStartDate = new Date(startDate);
        switch (dateRange) {
            case '1week':
                previousStartDate.setDate(previousStartDate.getDate() - 7);
                break;
            case '1month':
                previousStartDate.setMonth(previousStartDate.getMonth() - 1);
                break;
            case '3months':
                previousStartDate.setMonth(previousStartDate.getMonth() - 3);
                break;
            case '6months':
                previousStartDate.setMonth(previousStartDate.getMonth() - 6);
                break;
            case '1year':
                previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
                break;
        }

        // Fetch previous period data for comparison
        const previousPeriodData = dateRange !== 'all' ? await pb.collection('sessions').getList(1, 200, {
            filter: `branch_id = "${branchId}" && created >= "${previousStartDate.toISOString()}" && created < "${formattedStartDate}"`,
        }) : null;

        const previousRevenue = previousPeriodData?.items.reduce((acc, session) => {
            return acc + (session.total_amount || 0);
        }, 0) || 0;

        // Calculate percentage change
        const revenueChange = previousRevenue > 0
            ? ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
            : 0;

        // Get recent closed sessions
        const recentSessions = await pb.collection('sessions').getList(1, 5, {
            filter: `branch_id = "${branchId}" && status = "closed"`,
            sort: '-created',
            expand: 'user_id'
        });

        console.log('Recent sessions:', recentSessions);

        // Get popular games - Add type filter
        const popularGames = await pb.collection('inventory').getList(1, 5, {
            filter: `branch_id = "${branchId}" && type = "game"`,
            sort: '-popularity_score'
        });

        // Get data for revenue by day chart (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        const revenueByDay = last7Days.map(day => {
            const dayRevenue = sessionsData.items
                .filter(session => session.created.startsWith(day))
                .reduce((sum, session) => sum + (session.total_amount || 0), 0);
            return {
                name: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
                total: dayRevenue
            };
        });

        // Get data for game category distribution - Modified to use direct popularity scores
        const gameCategoryData = popularGames.items.map(game => ({
            name: game.name,
            value: game.popularity_score || 0
        }));

        return {
            totalRevenue: totalRevenue.toFixed(2),
            todayBookings: todaySessions,
            activeUsers: activeUsers.items.length,
            activeSessionsCount: activeSessions.items.length,
            revenueChange: revenueChange,
            periodLabel: getPeriodLabel(dateRange),
            activeSessionsDetails: activeSessions.items.map(session => ({
                id: session.id,
                startTime: session.start_time,
                userName: session.expand?.user_id?.username || 'Unknown',
                station: session.station_id,
                duration: session.duration
            })),
            recentSessions: recentSessions.items.map(session => ({
                id: session.id,
                customerName: session.expand?.user_id?.username || 'Unknown',
                user_id: session.user_id,
                user_image: session.expand?.user_id?.avatar,
                amount: session.total_amount,
                duration: session.duration,
                endTime: session.end_time
            })),
            popularGames: popularGames.items.map(game => ({
                id: game.id,
                name: game.name,
                popularity: game.popularity_score,
                category: game.category,
                game_image: game.avatar,
            })),
            revenueByDay,
            gameCategoryData // Now contains direct popularity scores per game
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
}

function getPeriodLabel(dateRange) {
    switch (dateRange) {
        case '1week':
            return 'Last 7 days';
        case '1month':
            return 'Last 30 days';
        case '3months':
            return 'Last 3 months';
        case '6months':
            return 'Last 6 months';
        case '1year':
            return 'Last year';
        default:
            return 'All time';
    }
}

export async function getSessionsByDateRange(branchId, startDate, endDate) {
    try {
        return await pb.collection('sessions').getList(1, 50, {
            filter: `branch_id = "${branchId}" && created >= "${startDate}" && created <= "${endDate}"`,
            expand: 'user_id,station_id'
        });
    } catch (error) {
        console.error('Error fetching sessions by date range:', error);
        throw error;
    }
}

export async function getActiveStations(branchId) {
    try {
        const stations = await pb.collection('sessions').getList(1, 50, {
            filter: `branch_id = "${branchId}" && status = "active"`,
            expand: 'current_session'
        });

        return stations.items.map(station => ({
            id: station.id,
            name: station.name,
            status: station.status,
            currentSession: station.expand?.current_session
        }));
    } catch (error) {
        console.error('Error fetching active stations:', error);
        throw error;
    }
}

export async function fetchDevices() {
    try {
        const branchId = localStorage.getItem('branchid');
        pb.autoCancellation(false);
        const records = await pb.collection('inventory').getList(1, 50, {
            filter: `branch_id = "${branchId}" && type = "device"`,
            sort: '-created'
        });
        return records.items;
    } catch (error) {
        console.error('Error fetching devices:', error);
    }
}

export const fetchGames = async () => {
    try {
        const branchId = localStorage.getItem('branchid');
        pb.autoCancellation(false);
        const records = await pb.collection('inventory').getList(1, 50, {
            filter: `branch_id = "${branchId}" && type = "game"`
        });
        return records.items;
    } catch (error) {
        console.error('Error fetching games:', error);
        return [];
    }
};

export async function fetchSnacks() {
    try {
        const branchId = localStorage.getItem('branchid');
        pb.autoCancellation(false);
        const records = await pb.collection('inventory').getList(1, 50, {
            filter: `branch_id = "${branchId}" && type = "snack"`,
        });
        return records.items;
    } catch (error) {
        console.error('Error fetching snacks:', error);
    }
}

export const fetchCustomers = async () => {
    try {
        const branchId = localStorage.getItem('branchid');
        pb.autoCancellation(false);
        const records = await pb.collection('customers').getList(1, 50, {
            filter: `branch_id = "${branchId}"`,
        });
        return records.items;
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
};

export const fetchPricing = async () => {
    try {
        const branchId = localStorage.getItem('branchid');
        pb.autoCancellation(false);
        const record = await pb.collection('pricing').getList(1, 50, {
            filter: `branch_id = "${branchId}"`
        });
        return record.items;
    } catch (error) {
        console.error('Error fetching pricing:', error);
    }
};
