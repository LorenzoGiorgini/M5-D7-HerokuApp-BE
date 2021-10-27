import PdfPrinter from "pdfmake";

//CONVERTS THE IMAGE IN base64 format
function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
  
    return new File([u8arr], filename, { type: mime });
}

export const createPDF = (data) => {
    let fonts = {
        Helvetica: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold'
        }
    }
      
    let printer = new PdfPrinter(fonts);


    if(data.imageUrl !== ""){

        const base64 = data.imageUrl.toDataURL();

        const file = dataURLtoFile(base64, "image.png");
    
        let docDefinition = {
            content: [
                {
                    image: file,
                    width: "100%"
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