const Chat = require("../models/chatModel");
const User = require("../models/User");

//@description     Create or fetch One to One Chat
//@route           POST /api/chat/
//@access          Protected

const accessChat = async( req , res) => {
    const { userId } = req.body;

    if(!userId)
    {
        res.status(400).json({ success : false, message: "User not found"});
    }

    try
    {
        let isChat = await Chat.find({
            isGroupChat : false,
            $and : [
                { users : { $elemMatch : { $eq : req.user._id}}},
                { users :  { $elemMatch : { $eq : userId }}},
            ]
        }).populate("users", "-password")
        .populate("latestMessage");

        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "name pic email"
        });

        if(isChat.length > 0)
        {
            res.send(isChat[0]);
        }
        else
        {
            const chatData = {
                chatName : "sender",
                isGroupChat : false,
                users : [req.user._id, userId]
            }

            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({_id: createdChat._id}).populate("users", "-password");
            res.status(200).json(FullChat);
        }

    }
    catch(error)
    {
        res.status(400).json({ success : false , message: error.message});
    }
}

//@description     Fetch all chats for a user
//@route           GET /api/chat/
//@access          Protected

const fetchChats = async( req, res ) => {

    try
    {
        let results = await Chat.find({ users: { $elemMatch : { $eq : req.user._id}}})
                                .populate("users" , "-password")
                                .populate("groupAdmin" , "-password")
                                .populate("latestMessage")
                                .sort({updatedAt : -1});
        results = await User.populate(results, {
            path : "latestMessage.sender",
            select : "name pic email"
        });

        res.status(200).send(results);
        
    }
    catch
    {
        res.status(400).json({ success : false , message: error.message});
    }
}

//@description     Create New Group Chat
//@route           POST /api/chat/group
//@access          Protected

const createGroupChat = async( req , res) => {
    if( !req.body.users || !req.body.name)
    {
        return res.status(400).json({ success : false , message: "Please Enter all the fields"});
    } 
    try
    {
        const users = JSON.parse(req.body.name);
        if(users.length < 2)
        {
            return res.status(400).json({ success : false , message: "More than 2 users are required to form a group chat"});
        }
        users.push(req.user);

        const groupChat = await Chat.create({
            chatName : req.body.name,
            users : users,
            isGroupChat : true,
            groupAdmin : req.user
        });

        const fullGroupChat = await Chat.findOne({_id : groupChat._id})
                                        .populate("users" , "-password")
                                        .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);

    }
    catch
    {
        res.status(400).json({ success : false , message: error.message});
    }
}

//@desc     Rename Group
//@route    PUT /api/chat/rename
//@access   Protected

const renameGroup = async( req, res) => {

    const { chatId, chatName} = req.body;
    try
    {
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { chatName },
            { new : true}
        ).populate("users" , "-password")
        .populate("groupAdmin", "-password");
        
        if(!updatedChat)
        {
            res.status(404).json({ success : false , message: "Chat Not Found"});
        }
        else
        {
            res.status(200).json(updatedChat);
        }
    }
    catch
    {
        res.status(400).json({ success : false , message: error.message});
    }
}

//@desc     Remove user from Group
//@route    PUT /api/chat/groupremove
//@access   Protected

const removeFromGroup = async( req, res) => {

    const { chatId, userId } = req.body;
    try
    {
        const removed = await Chat.findByIdAndUpdate(chatId, 
            { $pull : { users : userId} } ,
            { new : true}
        ).populate("users" , "-password")
        .populate("groupAdmin", "-password");

        if(!removed)
        {
            res.status(404).json({ success : false , message: "Chat Not Found"});
        }
        else
        {
            res.status(200).json(removed);
        }
    }
    catch
    {
        res.status(400).json({ success : false , message: error.message});
    }
}

//@desc     Add user to Group
//@route    PUT /api/chat/groupadd
//@access   Protected

const addToGroup = async( req, res) => {

    const { chatId, userId } = req.body;
    try
    {
        const added = await Chat.findByIdAndUpdate(chatId, 
            { $push : { users : userId} } ,
            { new : true}
        ).populate("users" , "-password")
        .populate("groupAdmin", "-password");

        if(!added)
        {
            res.status(404).json({ success : false , message: "Chat Not Found"});
        }
        else
        {
            res.status(200).json(added);
        }
    }
    catch
    {
        res.status(400).json({ success : false , message: error.message});
    }
}
module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
