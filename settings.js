import { hashPassword, salt } from './session.js';

// Event listener for setting password
document.getElementById('submitPassword').addEventListener('click', async () => {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password === confirmPassword && password) {
        const hashedPassword = await hashPassword(password, salt);
        chrome.storage.local.set({ 'password': hashedPassword, 'salt': salt }, () => {
            alert('Password set successfully.');
            document.getElementById('passwordForm').style.display = 'none';
            document.getElementById('storageOptions').style.display = 'none';
            document.getElementById('passwordEntry').style.display = 'block';
        });
    } else {
        alert('Passwords do not match or are empty. Please try again.');
    }
});

// Event listener for showing the password form
document.getElementById('local').addEventListener('click', () => {
    document.getElementById('passwordForm').style.display = 'block';
});

// Event listener for verifying password and entering the home page
document.getElementById('enterHome').addEventListener('click', async () => {
    const enteredPassword = document.getElementById('enterPassword').value;
    chrome.storage.local.get(['password', 'salt'], async function(result) {
        const hashedEnteredPassword = await hashPassword(enteredPassword, result.salt);
        if (hashedEnteredPassword === result.password) {
            window.location.href = 'home.html'; // Redirect to home page
        } else {
            alert('Incorrect password. Please try again.');
        }
    });
});



// CLOUD registration
document.getElementById('cloud').addEventListener('click', () => {
    document.getElementById('cloudForm').style.display = 'block';
});

// Server URL for registration
const serverUrl = 'http://localhost:3000/register';

document.getElementById('submitCloud').addEventListener('click', async () => {
    const email = document.getElementById('cloudEmail').value;
    const password = document.getElementById('cloudPassword').value;

    // Hash the password before sending
    // const hashedPassword = await hashPassword(password, salt);
    const hashedPassword = password;

    fetch(serverUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: hashedPassword }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Server responded with an error!');
        }
        return response.json();
    })
    .then(data => {
        console.log('Registration successful:', data);
        // Additional actions upon successful registration, e.g., hide the form
        document.getElementById('cloudForm').style.display = 'none';
        alert('Registration successful.' );
    })
    .catch(error => {
        console.error('Registration failed:', error);
        alert('Registration failed. Please try again.');
    });
});