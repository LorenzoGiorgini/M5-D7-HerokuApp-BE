import PdfPrinter from "pdfmake";


export const createPDF = (data) => {
    let fonts = {
        Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold'
        }
    }
      
    let printer = new PdfPrinter(fonts);


    if(data.imageUrl !== ""){
    
        let docDefinition = {
            content: [
                /* {
                    image: file,
                    width: "100%"
                } */,
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