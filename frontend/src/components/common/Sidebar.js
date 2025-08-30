import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import BookIcon from '@mui/icons-material/Book';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ window, mobileOpen, handleDrawerToggle, drawerWidth }) => {
    const { user } = useAuth();
    const location = useLocation();

    let menuItems = [];
    let panelTitle = '';

    if (user?.role === 'Admin') {
        panelTitle = 'ADMIN PANEL';
        menuItems = [
            { text: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
            { text: 'User Management', path: '/admin/users', icon: <PeopleIcon /> },
            { text: 'Subject Management', path: '/admin/subjects', icon: <BookIcon /> },
            { text: 'Faculty Requests', path: '/admin/faculty-requests', icon: <PeopleIcon /> },
            { text: 'Create Announcement', path: '/admin/announcement', icon: <CampaignIcon /> },
        ];
    } else if (user?.role === 'Faculty') {
        panelTitle = 'Faculty Portal';
        menuItems = [
            { text: 'Dashboard', path: '/faculty', icon: <DashboardIcon /> },
            { text: 'Schedule Lecture', path: '/faculty/schedule', icon: <CalendarMonthIcon /> },
            { text: 'Assignments', path: '/faculty/assignments', icon: <AssignmentIcon /> },
        ];
    } else {
        panelTitle = 'Student Portal';
        menuItems = [
            { text: 'Home', path: '/student', icon: <DashboardIcon /> },
            { text: 'My Schedule', path: '/student/schedule', icon: <CalendarMonthIcon /> },
            { text: 'Task Manager', path: '/student/tasks', icon: <AssignmentIcon /> },
            { text: 'Assignment Solver', path: '/student/assignment-solver', icon: <AutoFixHighIcon /> },
        ];
    }

    const drawerContent = (
        <Box sx={{ bgcolor: 'background.paper', color: 'text.primary', height: '100%'}}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2, flexDirection: 'column' }}>
                <Typography variant="h6" noWrap sx={{fontWeight: 'bold', color: 'primary.dark'}}>Smart Campus</Typography>
                <Typography variant="caption" color="text.secondary">{panelTitle}</Typography>
            </Toolbar>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} component={Link} to={item.path} disablePadding sx={{ my: 1, px: 2 }}>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            sx={{ 
                                borderRadius: '8px', 
                                '&.Mui-selected': { 
                                    backgroundColor: 'action.selected', 
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main',
                                    },
                                    '&:hover': { 
                                        backgroundColor: 'action.hover' 
                                    } 
                                },
                                '&:hover': {
                                    backgroundColor: 'action.hover'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'text.secondary', minWidth: '40px' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
            <Drawer
                container={container}
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
                }}
            >
                {drawerContent}
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;