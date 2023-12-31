import { hashPassword, salt } from './session.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check if the user is logged in
    chrome.storage.local.get(['isLoggedIn'], function(result) {
        if (result.isLoggedIn) {
            // User is already logged in, redirect to the home page
            window.location.href = 'popup.html';
        } else {
            // User is not logged in, you can continue with your login logic
            const localLogin = document.getElementById('localLogin');
            const cloudLogin = document.getElementById('cloudLogin');
            const emailField = document.getElementById('emailField');
    
            localLogin.addEventListener('change', () => {
                // Hide the email field when local login is selected
                emailField.style.display = 'none';
            });
            
            cloudLogin.addEventListener('change', () => {
                console.log('Cloud login selected'); // Debugging line
                emailField.style.display = 'block';
            });
            

        }
    });
});

document.getElementById('loginButton').addEventListener('click', async () => {
    const enteredPassword = document.getElementById('password').value;
    const loginMethod = document.querySelector('input[name="loginMethod"]:checked').value;

    if (loginMethod === 'local') {
        // Local login logic (similar to your existing code)
        // Use hashPassword for password verification
        chrome.storage.local.get(['password', 'salt'], async function(stored) {
            const hashedPassword = await hashPassword(enteredPassword, stored.salt);

            if (hashedPassword === stored.password) {
                chrome.storage.local.set({ 'isLoggedIn': true }, () => {
                    window.location.href = 'popup.html'; // Redirect to the main extension page
                });
            } else {
                alert('Incorrect password.');
            }
        });
    } else if (loginMethod === 'cloud') {
        // Cloud login logic
        const email = document.getElementById('email').value; // Get the user's email
        const password = document.getElementById('password').value; // Get the user's password

        // Modify this URL to match your cloud login endpoint
        const cloudLoginUrl = 'http://localhost:3000/login';

        // Create a JSON object with the email and password
        const loginData = {
            email: email,
            password: password
        };

        // Send a POST request to your cloud server
        fetch(cloudLoginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed'); // Handle login failure
            }
            return response.json();
        })
        .then(data => {
            // Handle successful login here
            console.log('Login successful:', data);
            const userId = data.userId;
            chrome.storage.local.set({ 'isLoggedIn': true, 'userId': userId }, () => {
                window.location.href = 'popup.html'; // Redirect to the main extension page
            });
        })
        .catch(error => {
            // Handle login error
            console.error('Login failed:', error);
            alert('Login failed. Please try again.');
        });
    }
});
