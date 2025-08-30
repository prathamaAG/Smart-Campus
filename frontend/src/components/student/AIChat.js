import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, CircularProgress, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';

const AIChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            // Call our secure backend endpoint
            const { data } = await api.post('/ai/chat', {
                history: messages,
                prompt: currentInput,
            });

            // The backend now sends a simple object: { responseText: "..." }
            const botResponse = data.responseText || "Sorry, I couldn't get a response. Please try again.";
            
            setMessages(prev => [...prev, { role: 'model', text: botResponse }]);

        } catch (error) {
            console.error("API call to backend failed:", error);
            const errorMessage = error.response?.data?.message || "There was an error connecting to the AI. Please check the console.";
            setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2, px: 1 }}>AI Assignment Solver</Typography>
            <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 1, mb: 2 }}>
                <AnimatePresence>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Box sx={{
                                my: 1,
                                display: 'flex',
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            }}>
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: msg.role === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                                        bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                                        color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                                        maxWidth: '70%',
                                    }}
                                >
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{msg.text}</Typography>
                                </Paper>
                            </Box>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                     <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <CircularProgress size={24} sx={{m: 2}} />
                     </Box>
                )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Ask a question about your assignment..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    disabled={isLoading}
                />
                <IconButton color="primary" onClick={handleSend} disabled={isLoading} sx={{ ml: 1 }}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Paper>
    );
};

export default AIChat;