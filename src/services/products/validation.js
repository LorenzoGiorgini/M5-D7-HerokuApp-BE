import expressValidator from "express-validator"
const {validationResult, body} = expressValidator




export const productChecker = [
  body("name").exists().withMessage("missing mandatory field!"),
  body("ratdescriptione").exists().withMessage("missing mandatory field!"),
  body("brand").exists().withMessage("missing mandatory field!"),
  body("price").exists().withMessage("missing mandatory field!"),
  body("category").exists().withMessage("missing mandatory field!"),


]



export const valueProductChecker=(req, res, next) => {
    
    const values = [ 'name', 'description', 'brand', 'imageUrl', 'price', 'category'  ]
    const bodySize=Object.keys(req.body).length;
    if(bodySize>6){

    res.status(500).send('too many values in the objects')

    }else{

        

        for(let i =0; i<values.length; i++){
            
            if(Object.keys(req.body)[i]!==values[i]){

                res.status(500).send('Wrong key values')
    
            }

        }
        next()
        

    }

}