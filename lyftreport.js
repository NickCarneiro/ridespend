var numeral = require('numeral');
/**
 *
 * @param rides array of ride objects generated in parseemail.js
 */
var generateLyftReport = function(rides) {
    if (!rides) {
        return null;
    }

    // count rides as we go. An email from lyft might be full of nulls.
    var totalRides = 0;

    var totalCost = 0;
    var mostExpensiveRide = 0;
    var leastExpensiveRide = 0;
    var longestRide = 0;
    var shortestRide = 0;
    var totalDistanceTraveled = 0;
    var lyftLineCount = 0;
    var primeTimeTipTotal = 0;
    var primeTimeCount = 0;
    var totalTipAmount = 0;
    var voluntaryTipCount = 0;
    var totalDuration = 0;
    var ridesWithDuration = 0;
    var ridesWithDistance = 0;
    var canceledRideCount = 0;

    rides.forEach(function(ride, i) {
        if (ride.totalCharge !== null) {
            totalRides += 1;
        }
        if (ride.totalCharge) {
            totalCost += ride.totalCharge;
        }

        if (ride.distance !== null) {
            ridesWithDistance++;
            totalDistanceTraveled += ride.distance;
        }
        if (ride.totalCharge > rides[mostExpensiveRide].totalCharge) {
            mostExpensiveRide = i;
        }
        if (ride.totalCharge < rides[leastExpensiveRide].totalCharge) {
            leastExpensiveRide = i;
        }
        if (ride.distance !== null && ride.distance > rides[longestRide].distance) {
            longestRide = i;
        }
        if (ride.distance !== null && ride.distance < rides[shortestRide]) {
            longestRide = i;
        }
        if (ride.duration !== null) {
            ridesWithDuration++;
            totalDuration += ride.duration;
        }
        if (ride.isLyftLine) {
            lyftLineCount++;
        }
        if (ride.primeTimeTip > 0) {
            primeTimeTipTotal += ride.primeTimeTip;
            primeTimeCount += 1;
        }

        if (ride.tip) {
            voluntaryTipCount++;
            totalTipAmount += ride.tip;
        }

        if (ride.isCanceled) {
            canceledRideCount++;
        }

    });

    var costPerMile = parseFloat(totalCost) / totalDistanceTraveled;
    var averageCost = parseFloat(totalCost) / totalRides;
    var averageRideDistance = parseFloat(totalDistanceTraveled) / ridesWithDistance;
    var averageDuration = parseFloat(totalDuration) / ridesWithDuration;

    // avoid divide by zero for exceptionally bad tippers
    var averageVoluntaryTipAmount = voluntaryTipCount ? (totalTipAmount / voluntaryTipCount) : 0;
    var averagePrimeTimeTipAmount = primeTimeCount ? (primeTimeTipTotal / primeTimeCount) : 0;
    var averageOverallTipAmount = (totalTipAmount + primeTimeTipTotal) / totalRides;

    return {
        totalRides: totalRides,
        totalCost: numeral(totalCost).format('$0,0.00'),
        averageCost: numeral(averageCost).format('$0,0.00'),
        mostExpensiveRide:  mostExpensiveRide,
        leastExpensiveRide: leastExpensiveRide,
        longestRide: longestRide,
        shortestRide: shortestRide,
        totalDistanceTraveled: numeral(totalDistanceTraveled).format('0,0.0'),
        totalDuration: numeral(totalDuration).format('0,0'),
        averageDuration: numeral(averageDuration).format('0,0'),
        lyftLineCount: lyftLineCount,
        primeTimeTipTotal: numeral(primeTimeTipTotal).format('$0,0.00'),
        primeTimeCount: primeTimeCount,
        averagePrimeTimeTipAmount: numeral(averagePrimeTimeTipAmount).format('$0,0.00'),
        totalVoluntaryTipAmount: numeral(totalTipAmount).format('$0,0.00'),
        averageVoluntaryTipAmount: numeral(averageVoluntaryTipAmount).format('$0,0.00'),
        averageRideDistance: numeral(averageRideDistance).format('0,0.00'),
        averageOverallTipAmount: numeral(averageOverallTipAmount).format('$0,0.00'),
        canceledRideCount: canceledRideCount,
        costPerMile: costPerMile
    }

};

module.exports = {
    generateLyftReport: generateLyftReport
};