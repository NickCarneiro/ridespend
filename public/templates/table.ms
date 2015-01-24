<table class="table table-striped">
    <tr>
        <td>
            Driver Name
        </td>
        <td>
            Ride End Time
        </td>
        <td>
            Distance (mi)
        </td>
        <td>
            Duration (min)
        </td>
        <td>
            Pickup Address
        </td>
        <td>
            Dropoff Address
        </td>
        <td>
            Total Charge
        </td>
        <td>
            Tip
        </td>
        <td>
            Prime Time Tip
        </td>
        <td>
            Prime Time Tip Percentage
        </td>
        <td>
            Lyft Line?
        </td>
    </tr>
{{#rides}}
    <tr>
        <td>
            {{ driverName }}
        </td>
        <td>
            {{ dateFormatted }}
        </td>
        <td>
            {{ distance }}
        </td>
        <td>
            {{ duration }}
        </td>
        <td>
            {{ pickupAddress }}
        </td>
        <td>
            {{ dropoffAddress }}
        </td>
        <td>
            {{ totalCharge }}
        </td>
        <td>
            {{ tip }}
        </td>
        <td>
            {{ primeTimeTip }}
        </td>
        <td>
            {{ primeTimeTipPercentage }}
        </td>
        <td>
            {{ isLyftLine }}
        </td>
    </tr>
{{/rides}}
</table>