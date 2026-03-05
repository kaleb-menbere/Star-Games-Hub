import React, { useState } from 'react';

const UserModal = ({ user, onClose, onSave }) => {
    const [form, setForm] = useState({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile || {}
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('profile.')) {
            const key = name.split('.')[1];
            setForm(prev => ({ ...prev, profile: { ...prev.profile, [key]: value } }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = () => {
        onSave(form);
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Edit User</h3>
                <div className="form-group">
                    <label>Email:</label>
                    <input name="email" value={form.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Username:</label>
                    <input name="username" value={form.username} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Role:</label>
                    <select name="role" value={form.role} onChange={handleChange}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Verified:</label>
                    <select name="isVerified" value={form.isVerified ? 'true' : 'false'} onChange={(e) => setForm(prev => ({ ...prev, isVerified: e.target.value === 'true' }))}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>First Name:</label>
                    <input name="profile.firstName" value={form.profile.firstName || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Last Name:</label>
                    <input name="profile.lastName" value={form.profile.lastName || ''} onChange={handleChange} />
                </div>
                {/* additional profile fields if needed */}
                <div className="modal-actions">
                    <button onClick={handleSubmit} className="btn-add">Save</button>
                    <button onClick={onClose} className="btn-delete">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default UserModal;