const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
                const sort = req.query?.sort;
                const sortByDate = req.query?.sortByDate;
                const sortByRating = req.query?.sortByRating; // New parameter for sorting by rating
                const page = parseInt(req.query?.page) || 1; // Default to page 1 if not provided
                const limit = parseInt(req.query?.limit) || 8; // Default to 8 products per page if not provided


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
                // Add condition for category name if it exists
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

                // Fetch products from the collection
                let cursor = productsCollection.find(query);



                // Apply sorting if the 'sort' parameter is provided
                if (sort) {
                    const sortDirection = sort === 'asc' ? 1 : -1; // 1 for asc, -1 for desc
                    cursor = cursor.sort({ price: sortDirection });
                }

                // Apply sorting by date if the 'sortByDate' parameter is provided
                if (sortByDate === 'recent') {
                    cursor = cursor.sort({ creationDateTime: -1 }); // Sort by date descending (recent first)
                }
                if (sortByRating) {
                    const ratingDirection = sortByRating === 'des' ? -1 : 1; // 1 for asc, -1 for desc
                    cursor = cursor.sort({ ratings: ratingDirection });
                }

                // Apply pagination
                const skip = (page - 1) * limit;
                cursor = cursor.skip(skip).limit(limit);

                // Fetch the paginated products
                const result = await cursor.toArray();

                // Calculate total number of documents for pagination
                const totalProducts = await productsCollection.countDocuments(query);
                const totalPages = Math.ceil(totalProducts / limit);

                // Send the result along with pagination info
                res.send({
                    products: result,
                    totalPages: totalPages,
                    currentPage: page,
                });
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).send({ error: 'An error occurred while fetching products' });
            }
        });

        //find one product by id
        app.get('/product/:id', async (req, res) => {
            const pId = req.params?.id
            const id = new ObjectId(pId)
            const query = { _id: id }
            const result = await productsCollection.findOne(query)
            res.send(result)
        })



        app.get('/unique-values', async (req, res) => {
            try {
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

                const [result] = await productsCollection.aggregate(aggregationPipeline).toArray();
                console.log(result)
                if (!result) {
                    // If no result is found, send an empty array
                    res.send({
                        uniqueBrands: [],
                        uniqueCategories: []
                    });
                } else {
                    res.send(result);
                }
            } catch (error) {
                console.error('Error fetching unique values:', error.message, error.stack);
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