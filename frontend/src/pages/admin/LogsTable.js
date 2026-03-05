import React from 'react';

const LogsTable = ({ logs, filter }) => {
    const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.action === filter);

    return (
        <div className="logs-table">
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Admin</th>
                        <th>Action</th>
                        <th>Game</th>
                        <th>Details</th>
                        <th>IP</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLogs.map(log => (
                        <tr key={log.id}>
                            <td>{new Date(log.createdAt).toLocaleString()}</td>
                            <td>{log.admin?.username || 'Unknown'}</td>
                            <td><span className={`action-badge ${log.action}`}>{log.action}</span></td>
                            <td>{log.game?.name || log.gameFolder}</td>
                            <td>
                                {log.details && Object.entries(log.details).map(([key, value]) => (
                                    <div key={key}><small>{key}: {JSON.stringify(value)}</small></div>
                                ))}
                            </td>
                            <td>{log.ipAddress}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LogsTable; // Make sure this is default export