import Box from '@mui/material/Box';

import { useEffect, useState } from 'react';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import '@xyflow/react/dist/style.css';
import { pb, pocketbaseUrl } from '../constants';
import type { RecordModel } from 'pocketbase';

const dashboardDates = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (29 - index));
    return date;
});

const loginsData = {

    "logins": [0, 0],
    "companyCreations": [0, 0],
    "institutionCreations": [0, 0],
    "institutionOfferCreations": [0, 0],
    "seniorOfferCreations": [0, 0],
    'xLabels': getDates()

}

function getDates(days = 180): string[] {
    const today = new Date();
    var dates: string[] = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        dates.push(date.toISOString().slice(0, 10));
        // counts.set(key, 0);
    }
    return dates;

}
async function getOffersOverTime(): Promise<[number[], number[]]> {

    var serviceOffers: RecordModel[] = []

    try {
        pb.autoCancellation(false);

        serviceOffers = await pb.collection('service_hosts').getFullList({
            sort: 'created',
            fields: 'created, recipients'
        });

    } catch (error) {
        console.log(error)
    }

    const institutionsForCompanies = new Map<string, number>();
    const offersForSeniors = new Map<string, number>();

    for (const date of getDates()) {
        institutionsForCompanies.set(date, 0);
        offersForSeniors.set(date, 0);
    }

    for (const host of serviceOffers) {
        const key = new Date(host.created).toISOString().slice(0, 10);
        if (host.type == "SENIORS")

            if (offersForSeniors.has(key)) {
                offersForSeniors.set(key, offersForSeniors.get(key)! + 1);
            }
            else {
                if (institutionsForCompanies.has(key)) {
                    institutionsForCompanies.set(key, institutionsForCompanies.get(key)! + 1);
                }
            }
    }

    return [Array.from(institutionsForCompanies, ([date, count]) => count), Array.from(offersForSeniors, ([date, count]) => count)];
};


async function getInstitutionOverTime(
): Promise<[number[], number[]]> {

    var serviceHosts: RecordModel[] = []

    try {
        pb.autoCancellation(false);

        serviceHosts = await pb.collection('service_hosts').getFullList({
            sort: 'created',
            fields: 'created, type'
        });

    } catch (error) {
        console.log(error)
    }

    const institutions = new Map<string, number>();
    const firms = new Map<string, number>();

    for (const date of getDates()) {
        institutions.set(date, 0);
        firms.set(date, 0);
    }

    for (const host of serviceHosts) {
        const key = new Date(host.created).toISOString().slice(0, 10);
        if (host.type == "PROVIDER")

            if (firms.has(key)) {
                firms.set(key, firms.get(key)! + 1);
            }
            else {
                if (institutions.has(key)) {
                    institutions.set(key, institutions.get(key)! + 1);
                }
            }
    }

    return [Array.from(firms, ([date, count]) => count), Array.from(institutions, ([date, count]) => count)];
};

async function getRegistrationsOverTime(

): Promise<number[]> {
    var users: RecordModel[] = []

    try {
        pb.autoCancellation(false);

        users = await pb.collection('users').getFullList({
            sort: 'created',
            fields: 'created'
        });


    } catch (error) {
        console.log(error)
    }

    const counts = new Map<string, number>();

    // Initialize every day so the chart doesn't have gaps.
    for (const date of getDates()) {
        counts.set(date, 0);
    }

    // Count registrations per day.
    for (const user of users) {
        const key = new Date(user.created).toISOString().slice(0, 10);

        if (counts.has(key)) {
            counts.set(key, counts.get(key)! + 1);
        }
    }

    return Array.from(counts, ([date, count]) => count);
}

export default function MainPlot() {
    // Simple plot displaying registered users; companies; offers etc.
    const [dailyCounts, setDailyCounts] = useState<{ logins: number[]; companyCreations: number[]; institutionCreations: number[]; institutionOfferCreations: number[]; seniorOfferCreations: number[]; xLabels: string[]; }>(loginsData);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserCounts = async () => {
            setIsLoading(true);
            var users = await getRegistrationsOverTime();
            var [institutions, firms] = await getInstitutionOverTime();
            var [offersForCompanies, offersForSeniors] = await getOffersOverTime();

            var dailyCountsCopy = dailyCounts;

            dailyCountsCopy.logins = users;
            dailyCountsCopy.companyCreations = firms;
            dailyCountsCopy.institutionCreations = institutions;
            dailyCountsCopy.seniorOfferCreations = offersForSeniors;
            dailyCountsCopy.institutionOfferCreations = offersForCompanies;


            setDailyCounts(dailyCountsCopy);
            setIsLoading(false);
        };

        void loadUserCounts();
    }, []);


    // console.log(dailyCounts)
    return (

        <Box sx={{
            height: 400,
            marginTop: "20px",
            marginRight: "50px",
            marginBottom: "50px",
            marginLeft: "50px",
            border: '3px solid #59636e',
            borderRadius: '16px',
        }}>
            <LineChart
                localeText={{
                    loading: 'Data should be available soon.',
                    noData: 'Select some data to display.',
                }}
                series={[
                    { data: dailyCounts["logins"], label: 'logins', color: '#FF0000' },
                    { data: dailyCounts["companyCreations"], label: 'companyCreations', color: '#0000FF' },
                    {
                        data: dailyCounts["institutionCreations"], label: 'institutionCreations', color: '#00FF00'
                    },
                    {
                        data: dailyCounts["seniorOfferCreations"], label: 'seniorOfferCreations', color: '#ff6f00'
                    },
                    {
                        data: dailyCounts["institutionOfferCreations"], label: 'institutionOfferCreations', color: '#ff6f00'
                    },
                ]}
                xAxis={[{ scaleType: 'point', data: dailyCounts["xLabels"], height: 28 }]}
                yAxis={[{ width: 50 }]}
                sx={{
                    [`& .${lineClasses.line}`]: {
                        // stroke: '#8884d8',
                        strokeWidth: 2,
                    }
                }}
                margin={{ right: 24 }}
            />

        </Box>

    );

}
