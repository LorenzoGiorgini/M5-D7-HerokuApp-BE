import PdfPrinter from "pdfmake";


export const createPDF = (data) => {
    let fonts = {
        Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold'
        }
    }
      
    let printer = new PdfPrinter(fonts);
    
    let docDefinition = {
        content: [
            `${data[0]._id}`
        ],
        defaultStyle: {
            font: "Helvetica"
        }
    }
    
    let options = {
        // ...
    }
      
    let pdfStream = printer.createPdfKitDocument(docDefinition, options);

    pdfStream.end()

    return pdfStream
}