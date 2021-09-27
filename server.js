'use strict'

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const server = express();
server.use(cors());
server.use(express.json())
const axios = require('axios')

const PORT = process.env.PORT;

//Mongoose

let FlowerModel;
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(`${process.env.MONGO_URL}`);

  const flowerSchema = new mongoose.Schema({
    name: String,
    instructions: String,
    photo: String,
    email: String
  });
  FlowerModel = mongoose.model('Flower', flowerSchema);
}

server.get('/flowers', flowersHandler)
server.post('/addFlower', addflowerHandler)
server.delete('/deleteFlower/:id', deleteflowerHandler)
server.put('/updateFlower/:id', updateflowerHandler)
server.get("/getFlower", getFlowerData);

async function getFlowerData(req, res) 
{
  const email = req.query.email;
  FlowerModel.find({ email: email }, (error, result) => {
    if (error) {
      console.log(error);
    }
    else {
      res.send(result)
      console.log(result);
    }
  })
}


function flowersHandler(req, res) {
  const flowersURL = 'https://flowers-api-13.herokuapp.com/getFlowers'

  axios
    .get(flowersURL)
    .then(arr => {
      console.log(arr.data);
      let newFlower = arr.data.flowerslist.map((item) => {
        return new Flowers(item)
      })
      res.send(newFlower)
    })
    .catch(error => {
      console.log(error);
    })
}


async function addflowerHandler(req, res) {
  const name = req.body.name;
  const instructions = req.body.instructions;
  const email = req.body.email;
  const photo = req.body.photo

  await FlowerModel.create({
    name: name,
    instructions: instructions,
    photo:photo,
    email: email
  });

  FlowerModel.find({ email: email }, (error, result) => {
    if (error) {
      console.log(error);
    }
    else {
      res.send(result)
      console.log(result);
    }
  })
}
async function deleteflowerHandler(req, res) {
  const flowerId = req.params.id
  const email = req.query.email
  FlowerModel.deleteOne({ _id: flowerId }, (error, result) => {
    FlowerModel.find({ email: email }, (error, result) => {
      if (error) {
        console.log(error);
      }
      else {
        res.send(result)
        console.log(result);
      }
    })
  })
}
async function updateflowerHandler(req, res) {
  const flowerId = req.params.id
  const { name, instructions, email } = req.body
  FlowerModel.findByIdAndUpdate(flowerId, { name, instructions }, (error, result) => {
    FlowerModel.find({ email: email }, (error, result) => {
      if (error) {
        console.log(error);
      }
      else {
        res.send(result)
        console.log(result);
      }
    })
  })
}


class Flowers {
  constructor(item) {
    this.name = item.name
    this.instructions = item.instructions
    this.photo = item.photo
  }
}

server.listen(PORT, () => {
  console.log(`${PORT}`);
})