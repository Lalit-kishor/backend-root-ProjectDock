import { Router } from 'express';
import { createNewProject } from '../controllers/project.controller.js';
import { verifyJWT } from '../middlewares/auth.js';
import { upload } from '../middlewares/multer.js';

const router = Router();
router.route('/new').post(verifyJWT, upload.array('images', 10) , createNewProject);

export default router;