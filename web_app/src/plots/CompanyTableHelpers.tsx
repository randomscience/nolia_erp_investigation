import type { RecordModel } from "pocketbase";

function format(a: string): string {
    if (a === undefined || a == '')
        return "-";
    return a;
}

export function formatZipCode(data: RecordModel): string {
    if (data.expand?.addresses === undefined) return "Null";
    var zipcode = format(data.expand?.addresses[0].zipcode)
    if (zipcode === "-") return "Null"
    return zipcode
}

export function formatGPS(data: RecordModel): string {
    if (data.expand?.addresses === undefined) return "Null";
    var location_lat = format(data.expand?.addresses[0].location?.lat)
    var location_lon = format(data.expand?.addresses[0].location?.lon)

    if (location_lat == "-" || location_lon == "-")
        return "Null"

    // https://www.google.com/maps?q=LATITUDE,LONGITUDE
    // https://www.google.com/maps?q=52.2297,21.0122

    return `${location_lat},${location_lon}`;

}
export function formatAddress(data: RecordModel): string {

    if (data.expand?.addresses === undefined) return "Null"


    var city = format(data.expand?.addresses[0].city)
    var home_number = format(data.expand?.addresses[0].home_number)
    var flat_number = format(data.expand?.addresses[0].flat_number)
    var street = format(data.expand?.addresses[0].street)


    if ([city
        , flat_number
        , home_number
        , street
    ].every(v => v === '-')) {
        return "Null"
    }

    return `${city} ul.${street} ${home_number}/${flat_number}`

}


export function formatInnerAddress(data: RecordModel): string {
    if (data.expand?.invoice_data === undefined) return "Null"

    if (data.expand?.invoice_data?.expand?.address === undefined) return "Null"


    var city = format(data.expand?.invoice_data?.expand?.address.city)
    var home_number = format(data.expand?.invoice_data?.expand?.address.home_number)
    var flat_number = format(data.expand?.invoice_data?.expand?.address.flat_number)
    var street = format(data.expand?.invoice_data?.expand?.address.street)


    if ([city
        , flat_number
        , home_number
        , street
    ].every(v => v === '-')) {
        return "Null"
    }

    return `${city} ul.${street} ${home_number}/${flat_number}`

}
export function formatInnerZipCode(data: RecordModel): string {
    if (data.expand?.invoice_data === undefined) return "Null"

    if (data.expand?.invoice_data?.expand?.address === undefined) return "Null"
    var zipcode = format(data.expand?.invoice_data?.expand?.zipcode)
    if (zipcode === "-") return "Null"
    return zipcode
}



export function countFillPercentage(company: RecordModel) {

    var sum = 0;
    var noFields = 0;
    for (var i = 0; i < Object.values(company).length; i++) {
        // if we have one of: "", null, undefined, [] in db, than the value is not provided.
        noFields++;
        var val = Object.values(company)[i]
        if (!(val == "" || val == null)) sum++;
    }
    return sum / noFields;
}