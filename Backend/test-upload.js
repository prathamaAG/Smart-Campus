// Simple test to see what happens when we call the controller directly
const { processAssignment } = require('./controllers/solverController');

// Mock request and response objects
const mockReq = {
    method: 'POST',
    headers: {},
    body: {
        paperType: 'Assignment',
        paperTitle: 'Test Paper'
    },
    file: null // This will trigger the "No file uploaded" error
};

const mockRes = {
    status: (code) => {
        console.log('Status:', code);
        return {
            json: (data) => {
                console.log('Response:', data);
            }
        }
    }
};

console.log('Testing controller directly...');
processAssignment(mockReq, mockRes);
