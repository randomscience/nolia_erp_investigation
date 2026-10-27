
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { pb } from '../constants';
import { formatDate, pbItemUrl } from '../helpers/PBFunctions';
import DownloadExcel from '../widgets/ExportToExcel';
import { countFillPercentage, formatAddress, formatGPS, formatZipCode } from './CompanyTableHelpers';

interface SquashedDBTableRowInterface {
    id: string | undefined
    name: string | undefined
    type: string

    adminName: string,
    adminSurname: string,
    adminEmail: string,
    status: string | undefined
    address: string | undefined
    zipCode: string | undefined
    gps: string | undefined
    phone: string,
    email: string,
    website: string
    fillPercentage: string | undefined
    created: string | undefined
}

export const DBSquashTable = () => {

    const [companiesList, setCompaniesList] = useState<RecordModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');


    useEffect(() => {
        let isActive = true;
        setIsLoading(true);
        setLoadError('');
        const loadCompanies = async () => {
            try {
                pb.autoCancellation(false);
                const companies = await pb.collection('service_hosts').getFullList({
                    sort: 'created',
                    expand: 'addresses,admins'
                });
                if (isActive) setCompaniesList(companies);
            } catch (error) {
                if (isActive) {
                    setLoadError(error instanceof Error ? error.message : 'Unable to load service_hosts.');
                }
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        void loadCompanies();
        return () => {
            isActive = false;
        };
    }, []);

    function expandCompanies(company: RecordModel): React.JSX.Element[] {
        var rows = [];
        console.log(company.expand?.admins[0]);
        for (var adminIndex = 0; adminIndex < company.expand?.admins.length; adminIndex++) {

            rows.push(
                <TableRow
                    key={company.id + "_" + company.expand?.admins[adminIndex]?.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                >
                    <TableCell><a href={pbItemUrl('service_hosts', company.id)}>{company.id || 'Null'}</a></TableCell>
                    <TableCell>{`${company.expand?.admins[adminIndex]?.name} ${company.expand?.admins[adminIndex]?.surname}` || "Null"}</TableCell>
                    <TableCell>{company.expand?.admins[adminIndex]?.email || "Null"}</TableCell>
                    <TableCell>{company.name || 'Null'}</TableCell>
                    <TableCell>{company.type || 'Null'}</TableCell>
                    <TableCell>{company.status || 'Null'}</TableCell>

                    <TableCell>{formatAddress(company)}</TableCell>
                    <TableCell>{formatZipCode(company)}</TableCell>
                    <TableCell> <a href={`https://www.google.com/maps?q=${formatGPS(company)}`}>{formatGPS(company)}</a> </TableCell>
                    <TableCell>{company.email || 'Null'}</TableCell>
                    <TableCell>{company.phone || 'Null'}</TableCell>
                    <TableCell>{company.website || 'Null'}</TableCell>

                    <TableCell>{`${countFillPercentage(company) * 100 | 0}%`}</TableCell>
                    <TableCell>{company.created ? formatDate(new Date(company.created)) : 'Unknown'}</TableCell>

                </TableRow >)
        }
        return rows;

    }

    function getTableRow(): SquashedDBTableRowInterface[] {

        const result: SquashedDBTableRowInterface[] = []
        for (var x of companiesList) {
            for (var adminIndex = 0; adminIndex < x.expand?.admins.length; adminIndex++) {
                result.push({
                    id: x.id,
                    name: x.name || 'Null',
                    adminName: x.expand?.admins[adminIndex]?.name,
                    adminSurname: x.expand?.admins[adminIndex]?.surname,
                    adminEmail: x.expand?.admins[adminIndex]?.email,
                    type: x.type,
                    // classificationClass: x.expanded?.service_host_recipients.classificationClass || "Null",
                    // classificationForm: x.expanded?.service_host_recipients.classificationForm || "Null",
                    status: x.status || 'Null',
                    address: formatAddress(x),
                    zipCode: formatZipCode(x),
                    gps: formatGPS(x),
                    email: x.email || 'Null',
                    phone: x.phone || 'Null',
                    website: x.website || 'Null',
                    fillPercentage: `${countFillPercentage(x) * 100 | 0}%`,
                    created: x ? formatDate(new Date(x.created)) : 'Unknown'
                })
            }
        }
        return result;

    };



    return <Box sx={{ mx: 6, my: 3 }}>

        {isLoading ? <CircularProgress size={24} aria-label="Loading users" /> : loadError ? <p>{loadError}</p> : (

            <TableContainer component={Paper} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, boxShadow: 'none' }}>
                <Table stickyHeader size="small" aria-label="Loaded users">
                    <TableHead>
                        <TableRow>
                            <TableCell>Id</TableCell>
                            <TableCell>Admin</TableCell>
                            <TableCell>Admin Email</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>ZipCode</TableCell>
                            <TableCell>GPS</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Website</TableCell>
                            <TableCell>Fill %</TableCell>
                            <TableCell>Created</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {companiesList.map((company: RecordModel) => (
                            expandCompanies(company)
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <DownloadExcel fileName={`Firmy w platformie`} data={getTableRow()} />
        </Box>
    </Box>;
}



