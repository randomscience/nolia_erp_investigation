import { pocketbaseUrl } from "../constants";

export function pbItemUrl(collection: string, id: string): string {
    return `${pocketbaseUrl}/_/#/collections?record=${id}&collection=${collection}`;
};