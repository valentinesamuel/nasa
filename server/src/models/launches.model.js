const axios = require('axios');
const launchesDatabase = require('./launches.mongo')
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100


const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function populateLaunches() {
    console.log('Downloading launch data');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }
    }
    )

    if (response.status !== 200) {
        console.log('Problem downloading launch data')
        throw new Error('Launch data download fail')
    }

    const launchDocs = response.data.docs
    for (const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads']
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['rocket']['name'],
            rocket: launchDoc['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            upcoming: launchDoc['upcoming'],
            customers
        }
        console.log(`${launch.rocket}, ${launch.mission}`);
        await saveLaunch(launch)
    }
}

async function loadLaunchData() {
    const firstLaunch = await findLaunch({
        mission: 'Falcon 1',
        rocket: 'FalconSat',
        flightNumber: 1
    })
    if (firstLaunch) {
        console.log('data already exists');
    } else {
        populateLaunches()
    }

}

async function findLaunch(filter) {
    return await launchesDatabase.findOne(filter)
}

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId
    })
}

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber')
    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER
    }
    return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
    return await launchesDatabase.find({}, {
        '__v': 0, '_id': 0
    }).sort({ flightNumber :1}).skip(skip).limit(limit)
}

async function saveLaunch(launch) {
    await launchesDatabase.findOneAndUpdate({
        flightNumber: launch.flightNumber,
    }, launch, {
        upsert: true
    })
}

async function scheduleNewLaunch(launch) {
    const planet = await planets.findOne({
        keplerName: launch.target
    })

    if (!planet) {
        throw new Error("No matching planets found")
    }

    const newFlightNumber = await getLatestFlightNumber() + 1
    const newLaunch = Object.assign(launch, {
        customers: ['Michval Architects', 'NASA'],
        upcoming: true,
        success: true,
        flightNumber: newFlightNumber
    })
    await saveLaunch(newLaunch)
}


async function abortLaunchById(launchId) {
    const aborted = await launchesDatabase.updateOne({
        flightNumber: launchId
    }, {
        upcoming: false,
        success: false
    })

    return aborted.matchedCount === 1 && aborted.acknowledged === true
}

module.exports = {
    loadLaunchData,
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById
}