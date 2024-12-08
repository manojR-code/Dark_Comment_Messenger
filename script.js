const express = require('express');
const bcrypt = require('bcrypt');
const msgModel = require('./model/message');
const path = require('path');
const multer = require('multer');
const userModel = require('./model/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const multerconfig = require('./utils/multerconfig');
const { profile } = require('console');
const upload = require('./utils/multerconfig');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.render("index")
})
app.post('/login', async (req, res) => {
    let { email, password } = req.body;
    let data = await userModel.findOne({ email });
    if (data) {
        let ress = await bcrypt.compare(password, data.password);
        if (ress) {
            try {
                let token = jwt.sign({ email }, "secret");
                res.cookie("token", token)
                res.redirect('/frame');
            } catch (error) {
                res.redirect('/');
            }
        }
        else { res.redirect('/') }
    } else {
        res.send("something went wrong");
    }
})
app.get('/create', (req, res) => {
    res.render("create")
})
app.post('/update',upload.single("image"), (req, res) => {
    let { name, email } = req.body;
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, async (err, hashs) => {
            password = hashs;
            await userModel.create({
                name,
                email,
                password: hashs,
                profile:req.file.filename
            })
        })
    })
    res.redirect('/')
})
app.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect('/')
})
app.get('/frame', async (req, res) => {
    try {
        let datas = jwt.verify(req.cookies.token, 'secret');
        let data = await userModel.find({ email: { $ne: datas.email } });
        let logined = await userModel.findOne({ email: datas.email });
        let messagsecom1 = await msgModel.find({ reacted: true, send: data._id });
        res.render("frame", { users: data, re: messagsecom1,login:logined.name,images:logined.profile });  
    } catch (error) {
        res.send("Please Login First")
    }
})
app.get('/profile', (req, res) => {
    res.render("profile");
})
app.get('/msg/:id', async (req, res) => {
    try {
        let arr = req.params.id;
        let datas = jwt.verify(req.cookies.token, 'secret');
        let data = await userModel.findOne({ email: datas.email });
        let name = await userModel.findOne({ _id: arr });
        let messagsecom = await msgModel.find({ send: data._id, rec: req.params.id })
        let messagsecom1 = await msgModel.find({ send: req.params.id, rec: data._id })
        messagsecom1.reacted = false;
        res.render('profile', { users: data, names: name, sent: messagsecom, rec: messagsecom1 });
    } catch (error) {
        res.send("Something went wrong");
    }
})
app.post('/send/:id', async (req, res) => {
    try {
        let datas = jwt.verify(req.cookies.token, 'secret');
        let data = await userModel.findOne({ email: datas.email });
        let recieved = await userModel.findOne({ _id: req.params.id });
        let msgs = await msgModel.create({
            rec: recieved._id,
            send: data._id,
            reacted: true
        })
        msgs.recs.push(req.body.message)
        msgs.sends.push(req.body.message)
        await msgs.save();
        res.redirect(`/msg/${req.params.id}`)
    } catch (error) {
        res.send("something went wrong");
    }
  
})
app.listen(5000)