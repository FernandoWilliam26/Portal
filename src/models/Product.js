import mongoose from 'mongoose';


const ProductSchema = new mongoose.Schema(
{
name: { type: String, required: true, trim: true },
description: { type: String, default: '' },
price: { type: Number, required: true, min: 0 },
imageUrl: { type: String, default: '' }
},
{ timestamps: true }
);


export const Product = mongoose.model('Product', ProductSchema);