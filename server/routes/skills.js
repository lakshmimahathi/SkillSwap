const router=require('express').Router(),db=require('../config/db');
router.get('/',async(_,res)=>{try{const [rows]=await db.query('SELECT id,name,category FROM skills ORDER BY name');res.json(rows);}catch(e){console.error(e);res.status(500).json({message:'Could not load skills.'});}});
module.exports=router;
