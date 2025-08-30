import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Avatar, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';

const Header = ({ handleDrawerToggle, toggleTheme, drawerWidth }) => {
    const theme = useTheme();
    const { user, logout } = useAuth();

    return (
        <AppBar
            position="fixed"
            color="default"
            elevation={0}
            sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
                bgcolor: 'background.paper',
                borderBottom: `1px solid ${theme.palette.divider}`
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
                    {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
                <Typography sx={{ mx: 1.5 }}>{user?.name}</Typography>
                <Avatar sx={{ cursor: 'pointer' }} onClick={logout}>{user?.name.charAt(0)}</Avatar>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
