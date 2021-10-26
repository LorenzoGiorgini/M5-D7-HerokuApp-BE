import express from 'express';
import cors from 'cors';
import listEndpoints from 'express-list-endpoints';
import reviewsRouter from './services/reviews/reviews.js';
import productsRouter from './services/products/products.js';
import { join } from "path"

const server = express();

const publicFolderPath = join(process.cwd(), "./public")

const whitelist = [process.env.FE_URL , process.env.FE_DEV_URL]
const corsOptions = {
    origin : function (origin, next) { 
        if (whitelist.includes(origin)) {
            next(null , true)
        } else {
            next(new Error("CROSS ORIGIN ERROR"))
        }
    }
}

console.log(corsOptions.origin)

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