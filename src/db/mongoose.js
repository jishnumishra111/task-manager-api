const mongoose = require('mongoose')

const mongodbURL = process.env.MONGODB_URL

mongoose.connect(mongodbURL, {
    useNewUrlParser:true
})




// const task = new Task({

//   description : "Complte Nodejs"
  
    
// })

// task.save().then(()=>{

//     console.log(task)

// }).catch((error)=>{
//     console.log('Error!',error)
// })

// const me = new User({
//     name:"Jishnu",
//     email:"JISHNU111@gmail.com",
//     age:37,
//     password :"11qasdfg"

   
// })

// me.save().then(() => {
//     console.log(me)
// }).catch((error) => {
//     console.log('Error!', error)
// })