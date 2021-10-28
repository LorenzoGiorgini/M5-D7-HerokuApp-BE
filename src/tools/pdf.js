import PdfPrinter from "pdfmake";
import {extname} from "path"
import fetch from "node-fetch";
import btoa from "btoa"
import { promisify } from "util";
import {pipeline} from "stream"
import { join , dirname } from "path"
import { fileURLToPath } from "url";
import fs from "fs-extra"

const fetchImage = async (data) => {
    let resp = await fetch(data , { responseType: "arraybuffer" })
    return resp.arrayBuffer()
}

export const createPDF = async (data) => {
    let fonts = {
        Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold'
        }
    }
      
    let printer = new PdfPrinter(fonts);


    if(data.imageUrl) {
        
        let imageBuffer = await fetchImage(data.imageUrl)

        const base64String = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

        const imageUrlPath = data.imageUrl.split('/')
        
        const fileName = imageUrlPath[imageUrlPath.length - 1]
        
        const extension = extname(fileName)

        const base64UrlPDF = `data:image/${extension};base64,${base64String}`

        let docDefinition = {
            content: [
                {
                    image: base64UrlPDF,
                    width: "500"
                },
                {
                    text: `${data.name}`,
                    style: "header"
                },
                {
                    text: [
                        `${data.description}`
                        ],
                    style: 'description'
                }   
            ],
            defaultStyle: {
                font: "Helvetica"
            },
            styles: {
                header: {
                    fontSize: 20,
                    bold: true
                },
                description: {
                    fontSize: 16,
                    bold: false
                }
            }
        }
        
        let options = {
            // ...
        }
          
        let pdfStream = printer.createPdfKitDocument(docDefinition, options);
    
        pdfStream.end()
    
        return pdfStream
    }
}


export const generatePDFAsync = async (data) => {
    const asyncPipeline = promisify(pipeline) // promisify is a (VERY COOL) utility which transforms a function that uses callbacks (error-first callbacks) into a function that uses Promises (and so Async/Await). Pipeline is a function that works with callbacks to connect 2 or more streams together --> I can promisify a pipeline getting back and asynchronous pipeline
  
    const fonts = {
      Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
      },
    }
  
    const printer = new PdfPrinter(fonts)

    if (data.imageUrl){

        let imageBuffer = await fetchImage(data.imageUrl)

        const base64String = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

        const imageUrlPath = data.imageUrl.split('/')
        
        const fileName = imageUrlPath[imageUrlPath.length - 1]
        
        const extension = extname(fileName)

        const base64UrlPDF = `data:image/${extension};base64,${base64String}`

        let docDefinition = {
            content: [
                {
                    image: base64UrlPDF,
                    width: "500"
                },
                {
                    text: `${data.name}`,
                    style: "header"
                },
                {
                    text: [
                        `${data.description}`
                        ],
                    style: 'description'
                }   
            ],
            defaultStyle: {
                font: "Helvetica"
            },
            styles: {
                header: {
                    fontSize: 20,
                    bold: true
                },
                description: {
                    fontSize: 16,
                    bold: false
                }
            }
        }

        const options = {
            // ...
        }
        
        const pdfReadableStream = printer.createPdfKitDocument(docDefinition, options)
        // pdfReadableStream.pipe(fs.createWriteStream('document.pdf')); // old syntax for piping
        // pipeline(pdfReadableStream, fs.createWriteStream('document.pdf')) // new syntax for piping (we don't want to pipe pdf into file on disk right now)
        pdfReadableStream.end()
        const path = join(dirname(fileURLToPath(import.meta.url)), `${data._id}.pdf`)
        await asyncPipeline(pdfReadableStream, fs.createWriteStream(path))
        return path
    }
  
  
}