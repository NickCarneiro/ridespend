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

    var averageCost = parseFloat(totalCost) / totalRides;
    var averageRideDistance = parseFloat(totalDistanceTraveled) / ridesWithDistance;
    var averageDuration = parseFloat(totalDuration) / ridesWithDuration;

    // avoid divide by zero for exceptionally bad tippers
    var averageVoluntaryTipAmount = voluntaryTipCount ? (totalTipAmount / voluntaryTipCount) : 0;
    var averagePrimeTimeTipAmount = primeTimeCount ? (primeTimeTipTotal / primeTimeCount) : 0;
    var averageOverallTipAmount = (totalTipAmount + primeTimeTipTotal) / totalRides;

    return {
        totalRides: totalRides,
        totalCost: totalCost,
        averageCost: averageCost,
        mostExpensiveRide:  mostExpensiveRide,
        leastExpensiveRide: leastExpensiveRide,
        longestRide: longestRide,
        shortestRide: shortestRide,
        totalDistanceTraveled: totalDistanceTraveled,
        totalDuration: totalDuration,
        averageDuration: averageDuration,
        lyftLineCount: lyftLineCount,
        primeTimeTipTotal: primeTimeTipTotal,
        primeTimeCount: primeTimeCount,
        averagePrimeTimeTipAmount: averagePrimeTimeTipAmount,
        totalVoluntaryTipAmount: totalTipAmount,
        averageVoluntaryTipAmount: averageVoluntaryTipAmount,
        averageRideDistance: averageRideDistance,
        averageOverallTipAmount: averageOverallTipAmount,
        canceledRideCount: canceledRideCount
    }

};

module.exports = {
    generateLyftReport: generateLyftReport
};