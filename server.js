const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const uri = "mongodb+srv://binhdocao:r83Skxn8X1trMIQ4@cluster0.ara0kr4.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const databaseName = "BookManage";
const usersCollection = "users";

// Create a custom middleware function for logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);
  next(); // Pass control to the next middleware or route handler
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toLocaleString()}] Error: ${err.message}`);
  res.status(500).json({ message: 'Internal server error' });
});

async function insertUser(client, email, password) {
    const database = client.db(databaseName);
    const users = database.collection(usersCollection);
    return await users.insertOne({ email, password, bookmarks: [] });
  }

async function findUserByEmail(client, email) {
  const database = client.db(databaseName);
  const users = database.collection(usersCollection);
  return await users.findOne({ email });
}

// Express route for user registration
app.post('/register', async (req, res) => {
  try {
    await client.connect();

    const { email, password } = req.body;
    console.log(`[${new Date().toLocaleString()}] Registration request received for email: ${email}`);

    const existingUser = await findUserByEmail(client, email);

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const result = await insertUser(client, email, password);
    res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
  } catch (e) {
    console.error(`[${new Date().toLocaleString()}] Error during registration: ${e.message}`);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

app.post('/login', async (req, res) => {
  try {
    await client.connect();

    const { email, password } = req.body;
    console.log(`[${new Date().toLocaleString()}] Login request received for email: ${email}`);

    const user = await findUserByEmail(client, email);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

if (password === user.password) {
    res.status(200).json({ message: 'Login successful', userId: user._id, bookmarks: user.bookmarks });
    } else {
    res.status(401).json({ message: 'Incorrect password' });
    }
      
  } catch (e) {
    console.error(`[${new Date().toLocaleString()}] Error during login: ${e.message}`);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
});

app.post('/addBookmark', async (req, res) => {
    const { userId, bookmark } = req.body;

    try {
        await client.connect();

        const database = client.db(databaseName);
        const users = database.collection(usersCollection);

        const result = await users.findOneAndUpdate(
            { _id: new ObjectId(userId) }, // Use new ObjectId here
            { $push: { bookmarks: bookmark } },
            { returnDocument: 'after' }
        );

        if (result.value) {
            res.status(200).json({ message: 'Bookmark added successfully', bookmarks: result.value.bookmarks });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (e) {
        console.error(`[${new Date().toLocaleString()}] Error adding bookmark: ${e.message}`);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.close();
    }
});


  
  app.get('/getBookmarks', async (req, res) => {
    const userId = req.query.userId; // Get the user ID from the query parameter

    try {
        await client.connect();

        const database = client.db(databaseName);
        const users = database.collection(usersCollection);

        const user = await users.findOne({ _id:new ObjectId(userId) });

        if (user) {
            const bookmarks = user.bookmarks || [];
            res.status(200).json({ bookmarks });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (e) {
        console.error(`[${new Date().toLocaleString()}] Error fetching bookmarks: ${e.message}`);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        await client.close();
    }
});

  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
