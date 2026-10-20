import { pocketbaseUrl } from "../constants";

export function pbItemUrl(collection: string, id: string): string {
    return `${pocketbaseUrl}/_/#/collections?record=${id}&collection=${collection}`;
};


export function formatDate(date: Date | number, displayHour: boolean = true): string {

    var parsedDate;

    if (typeof date === "number") {
        parsedDate = new Date(date);
    } else { parsedDate = date; }


    if (!Number.isNaN(parsedDate.getTime())) {

        var timeStr = `${String(parsedDate.getDate()).padStart(2, "0")}.${String(
            parsedDate.getMonth() + 1
        ).padStart(2, "0")}.${parsedDate.getFullYear()}`
        if (displayHour)
            timeStr += ` ${String(
                parsedDate.getHours()
            ).padStart(2, "0")}:${String(parsedDate.getMinutes()).padStart(2, "0")}`;
        return timeStr;
    }

    throw new Error(`Invalid value: ${date} expected valid "Date | number", got ${typeof date}`);

}