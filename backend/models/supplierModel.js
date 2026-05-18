import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  supplier_name: { 
    type: String, 
    required: true 
  },
  contact_number: { 
    type: String, 
    required: true,
    unique: true,  // This enforces uniqueness
    validate: {
      validator: function(v) {
        return /^[0-9]{10,15}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: { 
    type: String, 
    required: true,
    unique: true  // Also make email unique if needed
  },
  organisation: { 
    type: String, 
    required: true 
  },
});

// Add index to ensure quick lookup and enforce uniqueness
supplierSchema.index({ contact_number: 1 }, { unique: true });

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;