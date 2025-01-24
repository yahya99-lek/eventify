import { Schema, model, models, Document } from 'mongoose'

// Define the TypeScript interface for the Order document
export interface IOrder extends Document {
  createdAt: Date // Timestamp for when the order was created
  stripeId: string // Unique identifier for the order in Stripe
  totalAmount: string // Total amount for the order
  event: {           // Event details associated with the order
    _id: string      // ID of the event
    title: string    // Title of the event
  }
  buyer: {           // Buyer details associated with the order
    _id: string      // ID of the buyer
    firstName: string // Buyer's first name
    lastName: string // Buyer's last name
  }
}

// Define a type for a simplified representation of order items
export type IOrderItem = {
  _id: string           // ID of the order
  totalAmount: string   // Total amount for the order
  createdAt: Date       // Timestamp for order creation
  eventTitle: string    // Title of the event
  eventId: string       // ID of the event
  buyer: string         // Buyer details in string format
}

// Define the Mongoose schema for the Order model
const OrderSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date to the current time
  },
  stripeId: {
    type: String,
    required: true, // Stripe ID is mandatory
    unique: true, // Must be unique across all orders
  },
  totalAmount: {
    type: String, // The total order amount as a string
  },
  event: {
    type: Schema.Types.ObjectId, // Reference to the Event collection
    ref: 'Event', // Model being referenced
  },
  buyer: {
    type: Schema.Types.ObjectId, // Reference to the User collection
    ref: 'User', // Model being referenced
  },
})

// Create the Mongoose model for orders
const Order = models.Order || model('Order', OrderSchema)

export default Order // Export the model for use in other parts of the application
