import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useMessage } from '../../components/Message';
import UserModal from './UserModal';

const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { showMessage } = useMessage();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users');
            setUsers(res.data.data || []);
        } catch (err) {
            // console.error(err);
            showMessage(err.response?.data?.message || 'Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleSave = async (updated) => {
        try {
            await api.put(`/admin/users/${updated.id}`, updated);
            showMessage('User updated', 'success');
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            showMessage(err.response?.data?.message || 'Failed to update', 'error');
        }
    };

    return (
        <div className="users-tab">
            <div className="tab-header">
                <h2>All Users</h2>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="games-table-wrapper">
                    <table className="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Verified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.username}</td>
                                <td>{u.email}</td>
                                <td>{u.role}</td>
                                <td>{u.isVerified ? 'Yes' : 'No'}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEdit(u)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            )}

            {showModal && selectedUser && (
                <UserModal 
                    user={selectedUser}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default UsersTab;