module.exports = {
    stock: () => {
        return (req, res, next) => {
          let stock = req.query.stock;          
      
          //if stock not passed, error
          if (!stock) // No stock passed
            return res.status(400).json({error: 'Stock missing'});  
      
          if (Array.isArray(stock) && (!stock[0] || !stock[1])) {
            return res.status(400).json({error: 'One or more stocks missing'});  
          }
          
          //if no error
          next();
        }
    }
}