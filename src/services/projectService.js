import api from "../api/api";

export const getMembers = (projectId) =>
    api.get(`/projects/${projectId}/members`);

export const addMember = (projectId, userId) =>
    api.post(`/projects/${projectId}/members`, {
        user_id: userId
    });

export const removeMember = (projectId, userId) =>
    api.delete(`/projects/${projectId}/members/${userId}`);