import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom'; 

function PageNotFound() {
  return (
    <Box className="flex flex-col items-center justify-center h-screen p-4 bg-gray-100">
      <Box className="max-w-md w-full text-center">
        <Typography variant="h3" className="text-4xl font-bold text-gray-800">
          404
        </Typography>
        <Typography variant="body1" className="mt-4 text-xl text-gray-600">
          Oops! The page you are looking for does not exist.
        </Typography>
        <Button
          component={Link} 
          to="/"
          variant="contained"
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white"
          sx={{ borderRadius: '30px', padding: '10px 20px' }}
        >
          Go Back Home
        </Button>
      </Box>
    </Box>
  );
}

export default PageNotFound;
