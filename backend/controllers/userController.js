const User = require('../models/User');
const generateToken = require('../config/generateToken');

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public (Should be Protected)

const allUsers = async(req , res ) => {

    try
    {
        const keyword = req.query.search ?
        {
            $or : [
                {name : {$regex: req.query.search , $options: "i"}},
                {name : {$regex: req.query.search , $options: "i"}}
            ]
        }
        : {};

        const users = await User.find(keyword).find({_id : {$ne : req.user._id}});
        res.status(202).json({ syccess : true , message : "Users Fetched Successfully" , users});
    }
    catch(error)
    {
        res.status(400).json({ success : false , message: error.message});
    }

}

//@description     Register new user
//@route           POST /api/user/
//@access          Public

const registerUser = async(req, res) => {

    const { name, email, password, pic} = req.body;

    if(!name || !email || !password)
    {
        return res.status(400).json({ success : false , message: "Please Enter all the fields"});
    }
    try
    {
        const userExsists = await User.findOne({email});

        if(userExsists)
        {
            return res.status(400).json({ success : false , message: "User Already Exists"});
        }

        const user = await User.create({
            name,
            email,
            password,
            pic
        });

        if(user)
        {
            res.status(201).json({
                success : true,
                message : "User Created Successfully",
                _id : user._id,
                name : user.name,
                email : user.email,
                pic : user.pic,
                token : generateToken(user._id)
            });
        }
        else{
            res.status(400).json({ success : false , message: "Failed to Create User"});
        }

    }
    catch(error)
    {
        res.status(400).json({ success : false , message: error.message});
    }
}

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public

const authUser = async(req, res) => {
    const { email, password} = req.body;
    try
    {
        const user = await User.findOne({email});

        if(user && ( await user.matchPassword(password)))
        {
            res.status(201).json({
                success : true,
                message : "User loggedIn Successfully",
                _id : user._id,
                name : user.name,
                email : user.email,
                isAdmin : user.isAdmin,
                pic : user.pic,
                token : generateToken(user._id)
            });
        }
        else{
            res.status(400).json({ success : false , message: "Failed to loggedin User"});
        }
    }
    catch(error)
    {
        res.status(400).json({ success : false , message: error.message});
    }
}

module.exports = { allUsers, registerUser, authUser };
