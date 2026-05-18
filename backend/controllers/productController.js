import Product from "../models/productModel.js";

// Add a new product
export const addProduct = async (req, res) => {
  try {
    const { productName, genericName, category, purpose, gst } = req.body;

    // Validate required fields
    if (!productName || !genericName || !category || !purpose || gst === undefined) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newProduct = new Product({ productName, genericName, category, purpose, gst });
    await newProduct.save();
    res.status(201).json({ message: "Product added successfully!", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Failed to add product." });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products." });
  }
};

// Get a product by ID
 // Ensure you're using ES module imports

export const getProductById = async (req, res) => {
  console.log("Received ID:", req.params.id);  // Debugging log

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid product ID" });
  }

  try {
      const product = await Product.findById(req.params.id);
      if (!product) {
          return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
  } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};



// Update a product by ID
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { productName, genericName, category, purpose, gst } = req.body;

  try {
    // Validate required fields
    if (!productName || !genericName || !category || !purpose || gst === undefined) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { productName, genericName, category, purpose, gst },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found." });
    }

    res.status(200).json({ message: "Product updated successfully!", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product." });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product." });
  }
};
