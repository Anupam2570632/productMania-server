const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

app.use(express.json())
app.use(cors())


const port = process.env.PORT || 5000;


app.get('/', (req, res) => {
    res.send('server is running ...')
})



const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_password}@cluster0.oeipnk8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const productsCollection = client.db('productMania').collection('products')

        app.get('/products', async (req, res) => {
            try {
                const productName = req.query?.name;
                const brandName = req.query?.brandName;
                const category = req.query?.categoryName;
                const minPrice = parseFloat(req.query?.minPrice);
                const maxPrice = parseFloat(req.query?.maxPrice);

                // Create a query object
                const query = {};
                
                // Add condition for productName if it exists
                if (productName) {
                    query.productName = { $regex: new RegExp(productName, 'i') }; // Case-insensitive search
                }

                // Add condition for brandName if it exists
                if (brandName) {
                    query.brandName = brandName;
                }
                //Add condition for category name if it exist
                if (category) {
                    query.category = category;
                }

                // Add conditions for price range if they exist
                if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                    query.price = { $gte: minPrice, $lte: maxPrice };
                } else if (!isNaN(minPrice)) {
                    query.price = { $gte: minPrice };
                } else if (!isNaN(maxPrice)) {
                    query.price = { $lte: maxPrice };
                }

                // Fetch products from the collection based on the query
                const result = await productsCollection.find(query).toArray();

                // Send the result back to the client
                res.send(result);
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).send({ error: 'An error occurred while fetching products' });
            }
        });

        app.get('/unique-values', async (req, res) => {
            try {
                // Aggregate pipeline to get unique brand names and categories
                const aggregationPipeline = [
                    {
                        $group: {
                            _id: null,
                            uniqueBrands: { $addToSet: "$brandName" },
                            uniqueCategories: { $addToSet: "$category" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            uniqueBrands: 1,
                            uniqueCategories: 1
                        }
                    }
                ];

                // Execute aggregation
                const [result] = await productsCollection.aggregate(aggregationPipeline).toArray();

                // Send the unique values back to the client
                res.send(result);
            } catch (error) {
                console.error('Error fetching unique values:', error);
                res.status(500).send({ error: 'An error occurred while fetching unique values' });
            }
        });




        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`server is running on port : ${port}`)
})