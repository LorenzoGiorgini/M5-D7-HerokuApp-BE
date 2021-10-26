import express from 'express';
import cors from 'cors';
import listEndpoints from 'express-list-endpoints';
import reviewsRouter from './services/reviews/reviews.js';
import productsRouter from './services/products/products.js';
import { join } from "path"

const server = express();

const publicFolderPath = join(process.cwd(), "./public")


//Cors whitelisting and adding options
const whitelist = [process.env.FE_URL , process.env.FE_DEV_URL]
const corsOptions = {
    origin : function (origin, next) { 
        if (!origin || whitelist.indexOf(origin) !== -1) {
            next(null , true)
        } else {
            next(new Error("CROSS ORIGIN ERROR"))
        }
    }
}

server.use(express.static(publicFolderPath))
server.use(express.json());
server.use(cors(corsOptions));

server.use('/products', productsRouter);
server.use('/reviews', reviewsRouter);

const port = process.env.PORT;

console.table(listEndpoints(server));

server.listen(port , () => {
    console.log(port)
});