// hooks/useAuth.js
import { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

export const useAuth = () => {
  

   
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        console.log("tokennn ",token);
        
        if (token) {
            console.log("tokk ",token);
            
            const decodedToken = jwt.verify(token.split('=')[1], process.env.JWT_SECRETY); // Verify the token and extract user data
         return decodedToken;
        }
  
return
 
};
