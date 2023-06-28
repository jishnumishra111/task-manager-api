const express = require('express')
const Task =  require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

//Get /Tasks?completed=true
//GET /Tasks?limit=10&skip=0
//GET /Tasks?sortBy=createdAt_desc
router.get('/tasks',auth, async (req,res)=>{

//Set Default find Conditions
const findWhat = {
   owner: req.user._id,
};
 
// Add/Set Optional Find Conditions
if(req.query.completed) {
        findWhat.completed = req.query.completed === 'true';
}
 
// Set Default Find Options
const findOptions = {
    limit: 10,
    skip: 0,
    sort:{}
    

};
 
// Add/Set Optional Find Options
if(req.query.limit) {
   findOptions.limit = parseInt(req.query.limit);;
}
 
if(req.query.skip) {
   findOptions.skip = parseInt(req.query.skip);
}

if(req.query.sortBy){
    const parts = req.query.sortBy.split('_')
    
    findOptions.sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
}

    try {

        const tasks = await Task.find(findWhat, null, findOptions);

        if(tasks.length<1){
           return res.status(404).send("No task Found")
        }

        res.send(tasks)

        
        
    } catch (error) {
        res.status(500).send(error)
        
    }
})

router.get('/tasks/:id',auth, async (req,res)=>{

    try {

    const _id = req.params.id
    const task = await Task.findOne({

        _id,
        owner:req.user._id


    })

    if(!task){
        return res.status(404).send("No Task Found")
    }
    res.send(task)
        
    } catch (error) {
        
        res.status(500).send(error)
    }

})

router.post('/tasks',auth,(req, res)=>{

    //const task = new Task(req.body)

    const task = new Task({

        ...req.body,
        owner: req.user._id

    })

    task.save().then(()=>{

        res.send(task)

    }).catch((error)=>{
        res.status(400).send(error)
    })
})



router.patch('/tasks/:id', auth, async (req, res)=>{

    const updates = Object.keys(req.body)

    const allowedUpdates = ['description','completed']

    const isValidOperation = updates.every((update)=>{

        return allowedUpdates.includes(update)

    })

    if(!isValidOperation){
        return res.status(400).send("Operation not allowed")
    }
    try {

        //const task = await Task.findById(req.params.id)

        const task = await Task.findOne({
            _id:req.params.id,
            owner:req.user._id
        })

        updates.forEach((update)=>{
            task[update]=req.body[update]
        })

        //const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})

        if(!task){
            return res.status(404).send('Task does not exist')
        }
        res.send(task)

        
    } catch (error) {

        res.status(400).send(error)
        
    }

})


router.delete('/tasks/:id',auth, async (req,res)=>{

    try {

        const _id =  req.params.id

        const task = await Task.findOneAndDelete({
            _id,
            owner:req.user._id
        })

        if(!task){

            return res.status(404).send("No Task Found")
        }
        res.send(task)


        
    } catch (error) {

        res.status(400).send(error)
        
    }
})

module.exports = router