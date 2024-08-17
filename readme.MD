# ProductMania Server

This is the server-side code for the ProductMania website, a platform that allows users to browse and purchase products. This server provides APIs for fetching products, filtering, sorting, pagination, and retrieving unique brand names and categories.

## Features

- **Fetch Products**: Retrieve products with filtering, sorting, and pagination.
- **Sort by Date and Rating**: Sort products by creation date or rating.
- **Unique Values**: Retrieve unique brand names and categories.
- **Product Details**: Fetch detailed information for a single product.

## Technologies Used

- **Node.js**: JavaScript runtime.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing product information.
- **Cors**: Middleware to enable Cross-Origin Resource Sharing.
- **Dotenv**: Module to load environment variables.

## Getting Started

### Prerequisites

- **Node.js** installed on your machine.
- **MongoDB** instance (local or cloud) for the database.
- **.env** file with the following environment variables:
  - `DB_user`: productManiaAdmin
  - `DB_password`: pviISGRsWMybGnmE

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Anupam2570632/productMania-server
   
   cd ProductMania-server

   npm install