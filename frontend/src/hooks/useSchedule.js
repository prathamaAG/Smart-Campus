import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export const useSchedule = () => {
    const { user } = useAuth();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSchedule = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            console.log('useSchedule - Fetching for user:', user.name);
            const { data } = await api.get('/lectures/student');
            console.log('useSchedule - Received:', data.length, 'lectures');
            setSchedule(data);
        } catch (error) {
            console.error("Failed to fetch schedule", error);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchSchedule();
        }
    }, [user, fetchSchedule]);

    return {
        schedule,
        loading,
        refetch: fetchSchedule
    };
};