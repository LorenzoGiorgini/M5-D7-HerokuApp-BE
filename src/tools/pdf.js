import PdfPrinter from "pdfmake";
import {extname} from "path"
import fetch from "node-fetch";
import btoa from "btoa"

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