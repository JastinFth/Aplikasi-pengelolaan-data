const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { isAdmin, isUser } = require('../middleware/auth')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/profiles/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const validType = /jpeg|jpg|png/;
    const extname = validType.test(path.extname(file.originalname).toLowerCase());
    const mimetype = validType.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpeg .jpg and .png format allowed!'));  
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  }
});

router.get('/login', authController.getLoginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/admin/dashboard', isAdmin, adminController.getAllUsersDashboard);
router.get('/admin/users', isAdmin, adminController.getAllUsersUsers);
router.get('/admin/users/search', isAdmin, adminController.searchUser);
router.post('/admin/add', isAdmin, adminController.createUser);
router.post('/admin/edit/:id', isAdmin, adminController.updateUser);
router.post('/admin/delete/:id', isAdmin, adminController.deleteUser);
router.get('/admin/report', isAdmin, adminController.getAllUsersReport);
router.get('/admin/report/download', isAdmin, adminController.downloadLaporan);


router.get('/user/dashboard', isUser, userController.getAllDosirsDashboard);
router.get('/user/dosirs', isUser, userController.getAllDosirsDosirs);
router.get('/user/dosirs/search',isUser,  userController.searchDosir);
router.post('/user/add', isUser , userController.createDosir);
router.post('/user/edit/:id', isUser, userController.updateDosir);
router.post('/user/delete/:id', isUser, userController.deleteDosir);
router.get('/user/report', isUser, userController.getAllDosirsReport);
router.get('/user/report/download', isUser, userController.downloadLaporan);
router.get('/user/profile', isUser, userController.getProfile);
router.post('/user/profile/update', isUser, upload.single('profile_image'), userController.updateProfile)
router.post('/user/profile/update-password', isUser, userController.changePassword);

module.exports = router;