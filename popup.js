document.addEventListener('DOMContentLoaded', async () => {
  // Check if the user is logged in
  chrome.storage.local.get(['isLoggedIn', 'userId'], function(result) {
      if (!result.isLoggedIn) {
          window.location.href = 'login.html';
      } else {
          // Load stored bookmarks
          loadBookmarks();
          // Pass the result to addCurrentTabToBookmarks
          document.getElementById('addCurrentTabButton').addEventListener('click', function() {
            console.log('Button clicked'); // Debug line
            addCurrentTabToBookmarks(result.userId);
          });
          document.getElementById('settingsButton').addEventListener('click', function() {
            console.log('Button clicked'); // Debug line
            window.location.href = 'settings.html';
          });
          document.getElementById('logoutButton').addEventListener('click', function() {
            logoutUser();
        });
      }
  });

  
  document.getElementById('createFolderButton').addEventListener('click', createBookmarkFolder);
  // ... other event listeners ...
});

function logoutUser() {
  // Clear session data or any stored user data
  chrome.storage.local.remove(['isLoggedIn', 'userId'], function() {
      console.log('User logged out'); // Debug line
      // Redirect to login page or show a logged out message
      window.location.href = 'login.html';
  });

  // Additional logout actions can be added here
  // For example, if you have a server session, you might want to notify the server about the logout
}

// Function to load stored bookmarks
async function loadBookmarks() {
  // Check if the user is logged in
  chrome.storage.local.get(['isLoggedIn', 'userId'], async (result) => {
      if (!result.isLoggedIn) {
          window.location.href = 'login.html';
      } else {
          const userId = result.userId;

          // Fetch the user's bookmarks from the server
          try {
              const response = await fetch(`http://localhost:3000/getBookmarks?userId=${userId}`);
              if (!response.ok) {
                  throw new Error('Failed to fetch bookmarks');
              }

              const data = await response.json();
              const bookmarks = data.bookmarks || [];

              // Display the fetched bookmarks
              displayBookmarks(bookmarks);
          } catch (error) {
              console.error('Error fetching bookmarks:', error);
          }
      }
  });
}



// Function to add the current tab to bookmarks
function addCurrentTabToBookmarks(userId) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const tab = tabs[0];
      const bookmark = {
        title: tab.title,
        url: tab.url,
      };

      // Send the bookmark data and user ID to the server
      fetch('http://localhost:3000/addBookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, bookmark }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to add bookmark');
          }
          return response.json();
        })
        .then((data) => {
          // Handle the response, e.g., update the UI with the updated bookmarks
          console.log('Bookmark added successfully:', data);
          displayBookmarks(data.bookmarks); // Update the UI with the new bookmarks
        })
        .catch((error) => {
          console.error('Error adding bookmark:', error);
        });
    }
  });
}



// Function to create a new bookmark folder
function createBookmarkFolder() {
  // Logic to create a new folder and store it in Chrome Extension Storage
}

// Function to display bookmarks
function displayBookmarks(bookmarks) {
  const bookmarkList = document.getElementById('bookmarkList');
  bookmarkList.innerHTML = '';

  for (const bookmark of bookmarks) {
      const listItem = document.createElement('li');
      const link = document.createElement('a');
      link.textContent = bookmark.title;
      link.href = bookmark.url;
      link.target = '_blank';
      listItem.appendChild(link);
      bookmarkList.appendChild(listItem);
  }
}

// ... other functions ...
