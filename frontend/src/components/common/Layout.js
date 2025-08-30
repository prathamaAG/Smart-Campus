import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { motion } from 'framer-motion';
import Header from './Header'; // Import Header
import Sidebar from './Sidebar'; // Import Sidebar

const Layout = ({ children, toggleTheme }) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const drawerWidth = 240;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <CssBaseline />
            <Header handleDrawerToggle={handleDrawerToggle} toggleTheme={toggleTheme} drawerWidth={drawerWidth} />
            <Sidebar handleDrawerToggle={handleDrawerToggle} mobileOpen={mobileOpen} drawerWidth={drawerWidth} />
            <Box
                component="main"
                sx={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', height: '100vh', p: 0, overflow: 'hidden' }}
            >
                <Toolbar />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '0', height: '100%', overflowY: 'auto' }}
                >
                    {children}
                </motion.div>
            </Box>
        </Box>
    );
};

export default Layout;