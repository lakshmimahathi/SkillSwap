const router=require('express').Router(),db=require('../config/db'),auth=require('../middleware/auth');router.use(auth);
router.get('/',async(req,res)=>{try{const [rows]=await db.query(`SELECT r.*,a.name AS sender_name,b.name AS receiver_name,st.name AS teach_skill,sl.name AS learn_skill FROM swap_requests r JOIN users a ON a.id=r.sender_id JOIN users b ON b.id=r.receiver_id JOIN skills st ON st.id=r.teach_skill_id JOIN skills sl ON sl.id=r.learn_skill_id WHERE r.sender_id=? OR r.receiver_id=? ORDER BY r.created_at DESC`,[req.user.id,req.user.id]);res.json(rows);}catch(e){console.error(e);res.status(500).json({message:'Could not load requests.'});}});
router.post('/',async(req,res)=>{try{const {receiver_id,teach_skill_id,learn_skill_id}=req.body||{};if(!Number.isInteger(Number(receiver_id))||Number(receiver_id)===req.user.id)return res.status(400).json({message:'Choose a valid student.'});const [r]=await db.query('INSERT INTO swap_requests(sender_id,receiver_id,teach_skill_id,learn_skill_id) VALUES(?,?,?,?)',[req.user.id,Number(receiver_id),Number(teach_skill_id),Number(learn_skill_id)]);res.status(201).json({message:'Request sent.',id:r.insertId});}catch(e){console.error(e);res.status(500).json({message:'Could not send request.'});}});

router.patch('/:id',async(req,res)=>{
    try{
        const {status}=req.body||{};

        console.log('Accept debug:', {
            requestId: req.params.id,
            loggedInUserId: req.user.id,
            status: status
        });
if(!['accepted','rejected'].includes(status))return res.status(400).json({message:'Choose accept or reject.'});const [r]=await db.query(`UPDATE swap_requests SET status=? WHERE id=? AND receiver_id=? AND status='pending'`,[status,req.params.id,req.user.id]);if(!r.affectedRows)return res.status(404).json({message:'Pending request not found.'});res.json({message:'Request '+status+'.'});}catch(e){console.error(e);res.status(500).json({message:'Could not update request.'});}});
module.exports=router;
