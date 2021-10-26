import expressValidator from "express-validator"
const {validationResult, body} = expressValidator




export const reviewsChecker = [
  body("comment").exists().withMessage("missing mandatory field!"),
  body("rate").exists().withMessage("missing mandatory field!"),
  body("productId").exists().withMessage("missing mandatory field!"),


]

export const valueChecker=(req, res, next) => {
    
    const values = [ 'comment', 'rate', 'productId' ]
    const bodySize=Object.keys(req.body).length;
    if(bodySize>3){

    res.status(500).send('too many values in the objects')

    }else{

        if(Object.keys(req.body)['rate']>5){

            res.status(500).send('rate must be lower than 4')

        }

        for(let i =0; i<values.length; i++){
            
            if(Object.keys(req.body)[i]!==values[i]){

                res.status(500).send('Wrong key values')
    
            }

        }
        next()
        

    }

    

}

