const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail}=require('../emails/account')
const {sendCancelEmail}=require('../emails/account')

const router = new express.Router()

const upload = multer({
    
    limits:{
        fileSize:1000000
    },
    fileFilter(req, file, cb){

        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){

            return cb(new Error('Please upload Jpeg, jpg or png files'))
        }
        cb(undefined,true)

    }
})

router.get('/test',(req,res)=>{
    res.send('From a new file')
})


router.post('/users',async (req, res)=>{

   

    try {


        const user = new User(req.body)
        await user.save()
        sendWelcomeEmail(user.email,user.name)

        const token = await user.generateAuthToken()

        res.status(201).send({user,token})

        
    } catch (error) {

        res.status(400).send(error)
        
    }

  

})

router.post('/users/login', async (req, res)=>{

    try {

        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        
        //console.log(userObject)
        res.send({user,token})
        
    } catch (error) {

        res.status(400).send(error)
        
    }
})

router.post('/users/logout', auth, async (req, res)=>{

    try {

        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
        
    } catch (error) {

        res.status(500).send()
        
    }
})

router.post('/users/logoutAll',auth, async(req,res)=>{

    try{

        req.user.tokens = []

        await req.user.save()

        res.send()

    }catch(error){

        res.status(500).send()

    }



})

router.get('/users/me',auth,(req,res)=>{

  res.send(req.user)
})

// router.get('/users/:id', (req,res)=>{

//     const _id = req.params.id

//     User.findById(_id).then((user)=>{

//         if(!user){
//            return res.status(404).send("No User found")
//         }

//         res.send(user)

    

//     }).catch((err)=>{

//         res.status(500).send(err)

//     })

// })

router.patch('/users/me',auth, async (req, res)=>{

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','email','password','age']

    const isValidOperation = updates.every((update)=>{

        return allowedUpdates.includes(update)

    })

    if(!isValidOperation){
        return res.status(400).send('Operation not allowed')
    }



    try {

        

        updates.forEach((update)=>{

            req.user[update] =  req.body[update]

        })

        await req.user.save()

        //const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})

       
        res.send(req.user)
    } catch (error) {
        
        res.status(500).send(error)

    }


})


router.delete('/users/me',auth,async (req,res)=>{

    try {

        //console.log(req.user)

        //const _id = req.user._id

        // const user = await User.findByIdAndDelete(_id)
        // if(!user){
        //     return res.status(404).send("No user Found")
        // }
        const result = await req.user.deleteOne()
        sendCancelEmail(req.user.email,req.user.name)

       // console.log(result)
        res.send(req.user)


        
    } catch (error) {

        console.log(error)

        res.status(500).send(error)
        
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'),async (req, res)=>{

   
   const buffer = await sharp(req.file.buffer).resize({
    width:250,
    height:250
   }).png().toBuffer()

   req.user.avatar= buffer
   await req.user.save()

    res.send()

},(error,req,res,next)=>{
    res.status(400).send('error: '+error.message)
})


router.delete('/users/me/avatar', auth,async (req, res)=>{

    req.user.avatar= undefined
    await req.user.save()
 
     res.send()
 
 },(error,req,res,next)=>{
     res.status(400).send('error: '+error.message)
 })

 router.get('/users/:id/avatar',async (req,res)=>{

    try {

    const user = await User.findById(req.params.id)

    //console.log(user)

    if(!user || !user.avatar){

        throw new Error("new error")
    }

    res.contentType('image/png') 
    res.send(user.avatar)


        
    } catch (error) {

        res.status(404).send(error)
        
    }

 })

module.exports = router