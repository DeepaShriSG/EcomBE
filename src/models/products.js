import mongoose from '../models/index.js'

const productSchema = new mongoose.Schema({

    ProductTitle:{type:String, required:[true,"Title is required"]},
    ProductCode:{type:String, required:[true,"Product Code is required"]},
    brand:{type:String, required:[true,"Brand is required"]},
    imgurl:{type:[String],required:[true,"ImageURL is required"]},
    description:{type:String, required:[true,"Description is required"]},
    price:{type:Number,required:[true,"Price is required"]},
    stock:{type:Number, required:[true,"Stock is required"]},
    category: { type: String, required: [true, "Category is required"] },
    offer: { type: Boolean, default: false },
    Availability:{ type: Boolean, default: false },
    orders: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        quantity: { type: Number, required: true }
      }],
   },
   {
    collection:"Product",
    versionKey: false
})

const productModel = mongoose.model("Product",productSchema);

export default productModel;
