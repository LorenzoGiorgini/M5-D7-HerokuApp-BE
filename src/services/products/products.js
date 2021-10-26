import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import uniqid from 'uniqid';
import multer from 'multer';
import { extname } from 'path';
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
// import { validationResult } from 'express-validator';

import {productChecker, valueProductChecker} from './validation.js'



import createHttpError from 'http-errors';

const currentFilePath = fileURLToPath(import.meta.url)
const parentFolderPath = dirname(currentFilePath)
const reviewsJSON = join(parentFolderPath, "../../data/reviews.json")

const { readJSON, writeJSON, writeFile } = fs;



const productsRouter = express.Router();

const dataFolder = join(
	dirname(fileURLToPath(import.meta.url)),
	'../../data/products.json',
);

const allReviews = () => readJSON(reviewsJSON)

const allProducts = () => readJSON(dataFolder);


const cloudinaryStorage = new CloudinaryStorage({
	cloudinary,
	params: {
		folder: "Product-Folder"
	}
})

const writeProducts = (product) => writeJSON(dataFolder, product);
productsRouter.get('/', async (req, res, next) => {
	try {
		if(req.query.category){
			const products = await allProducts()
		console.log(req.query, 'sdsads')

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
		const products = await allProducts();
		const reviews = await allReviews()

	

		const filteredData = reviews.filter((product)=> product.productId === req.params._id )

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



export default productsRouter;