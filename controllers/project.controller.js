import { uploadOnCloudinary } from '../utils/cloudinary.js';
import projectModel from '../models/project.js';

// Handling the data, we receive from the project form
export const createNewProject = async (req, res) => {

    const { title, author, date, domain, desc, techStack, giturl, weburl } = req.body;
    // console.log('Text Section: ', req.body);

    // accessing image files and generating their local path
    const imageLocalPath = req.files?.map(file => file?.path);
    // console.log('Image Section: ', images);
    // console.log('Image Local Path: ', imageLocalPath);

    try {
        const cloudinaryURL = await Promise.all(imageLocalPath?.map(async (localPath)=> {
            const result = await uploadOnCloudinary(localPath);
            if(!result) {
                throw new Error('Cloudinary upload failed');
            }
            return result?.url;
        }));
    
        // console.log('Cloudinary URL: ', cloudinaryURL);
        
    
        const project = await projectModel.create({
            title,
            author,
            date,
            domain,
            desc,
            techStack,
            giturl,
            weburl,
            images: cloudinaryURL,
            owner: req.user._id,
            likes: [],
            bookmarks: [],
            comments: [],
        });
    
        const addedProject = await projectModel.findById(project._id);
        if(!addedProject) {
            return res.status(500).json({ message: 'Project not created' });
        }
    
        return res.status(200).json({ message: 'Project created successfully' });
    } catch (error) {
        console.log('Error in createNewProject: ', error);
        return res.status(500).json({ message: 'Something went wrong while adding project' });
    }
};