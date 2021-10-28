import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import uniqid from 'uniqid';
import multer from 'multer';
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"

import {productChecker, valueProductChecker} from './validation.js'


//all the required stuff to make a stream
import { createPDF , generatePDFAsync } from "../../tools/pdf.js"
import { pipeline } from 'stream';
import json2csv from "json2csv"
import sgMail from '@sendgrid/mail'


const currentFilePath = fileURLToPath(import.meta.url)
const parentFolderPath = dirname(currentFilePath)
const reviewsJSON = join(parentFolderPath, "../../data/reviews.json")

const { readJSON, writeJSON , createReadStream } = fs;



const productsRouter = express.Router();

const dataFolder = join(
	dirname(fileURLToPath(import.meta.url)),
	'../../data/products.json',
)

const allReviews = () => readJSON(reviewsJSON)

const allProducts = () => readJSON(dataFolder)

const getStream = () => createReadStream(dataFolder)


const cloudinaryStorage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "Product-Folder"
	}
})

const writeProducts = (product) => writeJSON(dataFolder, product);


sgMail.setApiKey(process.env.SENDGRID_API_KEY);


productsRouter.get('/downloadCSV' , (req, res, next) => {

	try {

		res.setHeader("Content-Disposition", "attachment; filename=products.csv")
		
		//source and destination of the stream
		const source = getStream()

		//tranformation layer
		const transform = new json2csv.Transform({fields: ["_id" ,"name" , "description" , "brand" , "imageUrl" , "price" , "category"]})

		//destination
		const destination = res

		pipeline(source, transform ,destination, error => {
			if(error) next(error)
		})
	
	} catch (error) {
		next(error);
	}
})



productsRouter.get('/', async (req, res, next) => {
	try {
		if(req.query.category){
			const products = await allProducts()

			const productsFiltered = products.filter((products) => products.category === req.query.category);
			res.status(200).send(productsFiltered)
		}else{
			const products = await allProducts();
			res.send(products);
		}

	} catch (error) {
		next(error);
	}
});

productsRouter.get('/:_id', async (req, res, next) => {
	try {
		const products = await allProducts();
		const singleProduct = products.filter((pro) => pro._id === req.params._id);
		res.send(singleProduct);

		
	} catch (error) {
		next(error);
	}
});



productsRouter.get('/:_id/reviews', async (req,res, next)=>{
	try{
		const reviews = await allReviews()

		const filteredData = reviews.filter((review)=> review.productId === req.params._id )

		res.status(200).send(filteredData)
	}catch(error){
		next(error);
	}
})

productsRouter.delete('/:_id', async (req, res, next) => {
	try {
		const products = await allProducts();

		const deletedProduct = products.filter((pro) => pro._id !== req.params._id);

		console.log('lol');

		await writeProducts(deletedProduct);

		res.status(204).send();
	} catch (error) {
		next(error);
	}
});


//Function to generate an email

const sendEmailToUser = async (emailRecipient, pdf , name) => {

	const msg = {
		to: emailRecipient,
		from: process.env.MY_EMAIL, // Use the email address or domain you verified above
		subject: 'Sending with Twilio SendGrid is Fun',
		text: 'and easy to do anywhere, even with Node.js',
		html: '<strong>and easy to do anywhere, even with Node.js</strong>',
		attachments: [
			{
			  content: pdf,
			  filename: `${name}`,
			  type: "application/pdf",
			  disposition: "attachment"
			}
		]
	};

	
	await sgMail.send(msg)
}

productsRouter.post('/', productChecker, valueProductChecker , async (req, res, next) => {
	try {

		const createdProduct = {
			_id: uniqid(),
			...req.body,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const products = await allProducts();

		products.push(createdProduct);

		await writeJSON(dataFolder, products);

		
		//creating the name for the pdf

		const path = await generatePDFAsync(createdProduct)

		const attachment = fs.readFileSync(path).toString("base64");

		await sendEmailToUser("masterrevenge34@gmail.com", attachment , createdProduct._id)

		res.status(201).send(createdProduct);
	} catch (error) {
		next(error);
	}
});


productsRouter.post('/:productId/uploadImage' , multer({storage: cloudinaryStorage}).single("imageUrl") , async (req, res, next) => {
	try {

		const products = await allProducts()

		const changeImage = products.find( product => product._id === req.params.productId)

		changeImage.imageUrl = req.file.path

		const productsFullArray = products.filter( product => product._id !== req.params.productId)

		productsFullArray.push(changeImage)
		
		await writeJSON(dataFolder ,productsFullArray)

		res.status(201).send("Image has been added succesfully")

	} catch (error) {
		next(error);
	}
});


productsRouter.put('/:productId' , valueProductChecker , async (req, res, next) => {
	try {

        const products = await allProducts();

        const productIndex = products.findIndex(product => product._id === req.params.productId)

        const updatedProduct = {
            ...products[productIndex],
            ...req.body,
            updatedAt: new Date()
        }

        products[productIndex] = updatedProduct;

        await writeJSON(dataFolder, products)

        res.status(200).send(updatedProduct)

	} catch (error) {
		next(error);
	}
});




//Products PDF maker
productsRouter.get('/:productId/downloadPDF' , async (req, res, next) => {

	try {
		const products = await allProducts();

		const data = products.find((product) => product._id === req.params.productId);
	
		res.setHeader('Content-Disposition', `attachment; filename=${data._id}.pdf`)

		//source and destination of the stream
		const source = await createPDF(data)
		
		const destination = res

		pipeline(source, destination, error => {
			if(error) next(error)
		})


	} catch (error) {
		next(error);
	}
})


export default productsRouter;