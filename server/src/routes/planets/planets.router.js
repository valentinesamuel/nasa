const express = require('express')
const planetsRouter = express.Router()

const { getAllPlanters } = require('./planets.controller')

planetsRouter.get('/planets', getAllPlanters)

module.exports = planetsRouter