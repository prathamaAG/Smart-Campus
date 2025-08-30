import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

const ScheduleLectureModal = ({ open, handleClose, refreshLectures }) => {
    // Placeholder modal content
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Schedule New Lecture</DialogTitle>
            <DialogContent>
                {/* Add form fields here */}
                <div>Lecture scheduling form goes here.</div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={() => { handleClose(); refreshLectures(); }}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ScheduleLectureModal;
