const jwt=require('jsonwebtoken');
const JWT_SECRET=process.env.JWT_SECRET||'change_this_secret';
function generateToken(user){return jwt.sign({id:user.id,email:user.email,is_subscribed:user.is_subscribed},JWT_SECRET,{expiresIn:'7d'});}
function verifyToken(token){try{return jwt.verify(token,JWT_SECRET);}catch(e){return null;}}
function requireAuth(req,res,next){const auth=req.headers.authorization;if(!auth) return res.status(401).json({error:'Missing Authorization'}); const [type,token]=auth.split(' '); if(type!=='Bearer'||!token)return res.status(401).json({error:'Invalid Auth'}); const payload=verifyToken(token); if(!payload)return res.status(401).json({error:'Invalid Token'}); req.user=payload; next();}
module.exports={generateToken,requireAuth};
