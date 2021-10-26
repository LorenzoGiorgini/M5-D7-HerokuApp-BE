import express from "express" 
import fs from "fs-extra" 
import { fileURLToPath } from "url" 
import { dirname, join } from "path" 
import uniqid from "uniqid" 
import {reviewsChecker, valueChecker} from './validation.js'




const  {readJSON, writeJSON} = fs


const reviewsRouter = express.Router()

const currentFilePath = fileURLToPath(import.meta.url)
const parentFolderPath = dirname(currentFilePath)

const reviewsJSON = join(parentFolderPath, "../../data/reviews.json")
const productsJSON = join(parentFolderPath, "../../data/products.json")




reviewsRouter.post("/:id", reviewsChecker, valueChecker, async (req, res) =>{
    const newReview = {
        ...req.body,
        _id: uniqid(),
        createdAt: new Date()

    }

    const file = await readJSON(productsJSON)
 
     

    const index = file.findIndex(product => product._id ===req.params.id  )

    

    if(index === -1){
        res
          .status(404)
          .send({ message: `invalid ${req.params.id}` });

    }else{
       

        const reviews = JSON.parse(fs.readFileSync(reviewsJSON))
        reviews.push(newReview)
    
        fs.writeFileSync(reviewsJSON, JSON.stringify(reviews))
        res.status(201).send({created: newReview.createdAt})
        
    }


})

reviewsRouter.put("/:id", async (req, res) =>{

    const file = await readJSON(reviewsJSON)
 
     

    const index = file.findIndex(review => review._id ===req.params.id  )

    if(index===-1){

        res.status(201).send({created: newReview.createdAt})


    }else{
        const updatedReview = {...file[index], ...req.body}
        file[index] = updatedReview
        fs.writeFileSync(reviewsJSON, JSON.stringify(file))
        res.send(updatedReview)
    }
})


reviewsRouter.get("/:id", (req, res) =>{
    const reviews = JSON.parse(fs.readFileSync(reviewsJSON))


    const review = reviews.find(s => s.id === req.params.id)
    
  
    res.send(review)
})

reviewsRouter.delete("/:id",async (req, res) =>{
    try {
		const reviews =  JSON.parse(fs.readFileSync(reviewsJSON))

		const deletedReviews = reviews.filter((review) => review._id !== req.params.id);
		
		 
        fs.writeFileSync(reviewsJSON, JSON.stringify(deletedReviews) );
		res.status(200).send('deleted');
	} catch (error) {
		next(error);
	}
})


export default reviewsRouter