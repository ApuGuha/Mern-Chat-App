const Message = require("../models/messageModel");
const User = require("../models/User");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected

const allMessages = async ( req , res) => {
    try
    {
        const message = await Message.find({chat : req.params.chatId}).populate("sender", "name pic email").populate("chat");
        res.status(202).json(message);

    }
    catch
    {
        res.status(400).json({ success : false , message: error.message});
    }
}

//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected

const sendMessage = async ( req, res ) => {
    const { content, chatId} = req.body;

    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    let newMessage = {
        sender : req.user._id,
        content : content,
        chat : chatId
    }

    try
    {
        let message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path : "chat.users",
            select : "name pic email"
        });

        await Chat.findByIdAndUpdate(req.body.chatId, {latestMessage : message});

        res.status(201).json(message);
    }
    catch
    {
        res.status(400).json({ success : false , message: error.message});
    }
}
module.exports = { allMessages, sendMessage };