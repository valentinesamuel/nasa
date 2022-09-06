const {planets} = require('../../models/planets.model')
function getAllPlanters(req, res) {
    res.status(200).json(planets)
}

module.exports = {
    getAllPlanters
}