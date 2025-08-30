import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, Chip } from '@mui/material';
import api from '../../api/api';
import moment from 'moment';

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await api.get('/announcements');
                setAnnouncements(res.data);
            } catch (error) {
                console.error("Failed to fetch announcements", error);
            }
        };

        fetchAnnouncements();
        // Poll for new announcements every 30 seconds
        const interval = setInterval(fetchAnnouncements, 30000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <Paper sx={{ p: 3, borderRadius: '16px', bgcolor: 'warning.main', color: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Announcements</Typography>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <List>
                    {announcements.map((ann, index) => (
                        <React.Fragment key={ann._id}>
                            <ListItem alignItems="flex-start">
                                <ListItemText
                                    primary={
                                        <Typography sx={{ fontWeight: 'bold', color: 'white' }}>
                                            {ann.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                sx={{ display: 'block', color: 'rgba(255,255,255,0.8)', my: 1 }}
                                            >
                                                {ann.message}
                                            </Typography>
                                            <Chip 
                                                label={`By ${ann.author?.name || 'Admin'} ・ ${moment(ann.createdAt).fromNow()}`} 
                                                size="small"
                                                sx={{ bgcolor: 'rgba(0,0,0,0.2)', color: 'white' }}
                                            />
                                        </>
                                    }
                                />
                            </ListItem>
                            {index < announcements.length - 1 && <Divider variant="inset" component="li" sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />}
                        </React.Fragment>
                    ))}
                </List>
            </Box>
        </Paper>
    );
};

export default Announcements;
