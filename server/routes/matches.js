
const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT DISTINCT
                 u.id AS user_id,
                 u.name,
                 u.bio,
                 their_skill.name AS they_teach,
                 my_skill.name AS you_teach,
                 st.skill_id AS learn_skill_id,
                 mt.skill_id AS teach_skill_id
             FROM user_skills ml
                      JOIN user_skills st
                           ON st.skill_id = ml.skill_id
                               AND st.type = 'teach'
                      JOIN user_skills tl
                           ON tl.user_id = st.user_id
                               AND tl.type = 'learn'
                      JOIN user_skills mt
                           ON mt.user_id = ?
                               AND mt.type = 'teach'
                               AND mt.skill_id = tl.skill_id
                      JOIN skills their_skill
                           ON their_skill.id = st.skill_id
                      JOIN skills my_skill
                           ON my_skill.id = mt.skill_id
                      JOIN users u
                           ON u.id = st.user_id
             WHERE ml.user_id = ?
               AND ml.type = 'learn'
               AND u.id <> ?
             ORDER BY u.name`,
            [req.user.id, req.user.id, req.user.id]
        );

        res.json(rows);
    } catch (e) {
        console.error('Matches query failed:', e);
        res.status(500).json({ message: 'Could not find matches.' });
    }
});

module.exports = router;
