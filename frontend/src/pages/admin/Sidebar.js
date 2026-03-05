import React from 'react';

const Sidebar = ({ activeTab, onTabChange }) => {
    const menuItems = [
        { id: 'games', label: 'Games Management', icon: '🎮' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'logs', label: 'Admin Logs', icon: '📋' }
    ];

    return (
        <div className="admin-sidebar">
            <h2>Admin Panel</h2>
            <nav>
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        className={activeTab === item.id ? 'active' : ''}
                        onClick={() => onTabChange(item.id)}
                    >
                        <span className="menu-icon">{item.icon}</span>
                        <span className="menu-label">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;