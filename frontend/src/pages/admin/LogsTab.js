import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LogsTable from './LogsTable';

const LogsTab = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await api.get('/admin/logs');
            setLogs(response.data.data || []);
        } catch (error) {
            console.error('Fetch logs error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterOptions = [
        { value: 'all', label: 'All Actions' },
        { value: 'CREATE', label: 'Create' },
        { value: 'UPDATE', label: 'Update' },
        { value: 'DELETE_SOFT', label: 'Soft Delete' },
        { value: 'DELETE_PERMANENT', label: 'Permanent Delete' },
        { value: 'UPLOAD', label: 'Upload' },
        { value: 'UPLOAD_IMAGES', label: 'Upload Images' },
        { value: 'DELETE_IMAGE', label: 'Delete Image' }
    ];

    if (loading) return <div className="loading">Loading logs...</div>;

    return (
        <div className="logs-tab">
            <div className="tab-header">
                <h2>Admin Activity Logs</h2>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    {filterOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>

            <LogsTable logs={logs} filter={filter} />
        </div>
    );
};

export default LogsTab; // Make sure this is default export