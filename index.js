const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;


// Use cors and JSON parsing middleware
app.use(cors());
app.use(express.json()); // This is necessary to parse JSON data in the request body

const uri = `mongodb+srv://awesome:zBRLpodNN0PFL0Tx@cluster0.j0rll9s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// MongoDB connection URI
// const uri = "mongodb://localhost:27017";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect to the database and set up the route
async function run() {
    try {
        // Connect the client to the server
        await client.connect();

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const coffeesCollection = client.db("test").collection("coffees");

        // Define the GET route for fetching coffees
        app.get('/coffees', async (req, res) => {
            try {
                const coffees = await coffeesCollection.find({}).toArray(); // Fetch all documents in the coffees collection
                res.json(coffees); // Send the fetched coffees as a JSON response
            } catch (error) {
                console.error("Error fetching coffees:", error);
                res.status(500).json({ error: 'An error occurred while fetching coffees.' });
            }
        });

        // POST route for adding a coffee
        app.post('/add', async (req, res) => {
            const data = {
                name: req.body.name,
                description: req.body.description,
                imagelink_square: req.body.imagelink_square,
                imagelink_portrait: req.body.imagelink_portrait,
                special_ingredient: req.body.special_ingredient,
                prices: req.body.prices,
                ratings_count: req.body.ratings_count,
                favourite: req.body.favourite,
                ingredients: req.body.ingredients,
                type: req.body.type,
                roasted: req.body.roasted,
            };
        
            try {
                const result = await coffeesCollection.insertOne(data);
                res.status(201).json(result);
            } catch (error) {
                console.error('Error adding coffee:', error);
                res.status(500).json({ error: 'Failed to add coffee' });
            }
        });
        

        // PUT route for updating a coffee
        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const updateData = req.body; // This contains the fields to update
        
            try {
                const query = { _id: new ObjectId(id) };
                const updateDocument = {
                    $set: updateData, // Directly set the fields to be updated
                };
        
                const result = await coffeesCollection.updateOne(query, updateDocument);
        
                if (result.matchedCount === 0) {
                    return res.status(404).json({ message: 'Coffee not found' });
                }
        
                res.status(200).json({ message: 'Coffee updated successfully', result });
            } catch (error) {
                console.error('Error updating coffee:', error);
                res.status(500).json({ error: 'Failed to update coffee' });
            }
        });
        
        // DELETE route for deleting a coffee
        app.delete('/coffees/:id', async (req, res) => {
            const id = req.params.id;

            try {
                const result = await coffeesCollection.deleteOne({ _id: new ObjectId(id) });

                if (result.deletedCount === 0) {
                    return res.status(404).json({ message: 'Coffee not found' });
                }

                res.status(200).json({ message: 'Coffee deleted successfully' });
            } catch (error) {
                console.error('Error deleting coffee:', error);
                res.status(500).json({ error: 'Failed to delete coffee' });
            }
        });

    } finally {
        // Optionally close the client connection
        // await client.close();
    }
}

run().catch(console.dir);

// Start the server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
