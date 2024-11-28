import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const newProjectSchema = new mongoose.Schema({
    
    title: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    domain: {
        type: String,
        required: true
    },
    techStack: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true,
        trim: true
    },
    giturl: {
        type: String,
        required: true,
        trim: true
    },
    weburl: {
        type: String,
        trim: true
    },
    images: [
        {
            type: String //Cloudinary URL
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    bookmarks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    comments: [commentSchema]

});

const newProjectModel = mongoose.model("NewProject", newProjectSchema);
export default newProjectModel;