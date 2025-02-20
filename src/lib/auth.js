export const isLimitedUser = (user) => {
    return user?.role === 'Staff' || user?.role === 'StoreManager';
};

export const canAccessRoute = (user, route) => {
    if (!user) return false;
    
    if (isLimitedUser(user)) {
        return route.startsWith('/booking');
    }
    
    return true;
};
