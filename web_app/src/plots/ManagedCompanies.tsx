

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
import '@xyflow/react/dist/style.css';
import { pb, } from '../constants';

import type { RecordModel } from 'pocketbase';
import { formatDate, pbItemUrl } from '../helpers/PBFunctions';
import DownloadExcel from '../widgets/ExportToExcel';

interface ManagedCompaniesInterface {
    id: string

    adminName: string
    adminSurname: string
    adminEmail: string

    name: string
    status: string
    fillPercentage: string
    created: string
}

export const ManagedCompanies = ({ user, onCompaniesLoaded }: {
    user: RecordModel;
    onCompaniesLoaded: (companies: RecordModel[]) => void;
}) => {
    const [companiesList, setCompaniesList] = useState<RecordModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let isActive = true;
        setIsLoading(true);
        setLoadError('');
        onCompaniesLoaded([]);
        const loadCompanies = async () => {
            try {
                pb.autoCancellation(false);

                const companies = await pb.collection('service_hosts').getFullList({
                    sort: 'created',
                });
                // TODO fold it into db search
                const result = companies.filter((company) =>
                    (company.admins as string[] | undefined)?.includes(user.id),
                );
                if (isActive) {
                    setCompaniesList(result);
                    onCompaniesLoaded(result);
                }
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
    }, [user, onCompaniesLoaded]);

    function countFillPercentage(company: RecordModel) {

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

    function getTableRow(): ManagedCompaniesInterface[] {

        const result: ManagedCompaniesInterface[] = []
        for (var x of companiesList) {
            result.push({
                id: x.id,
                adminName: user.name,
                adminSurname: user.surname,
                adminEmail: user.email,

                name: x.name || 'Null',
                status: x.status || 'Null',
                fillPercentage: `${countFillPercentage(x) * 100 | 0}%`,
                created: x ? formatDate(new Date(x.created)) : 'Unknown'
            })
        }
        return result;

    };


    return <Box sx={{ mx: 6, my: 3 }}>
        {isLoading ? <CircularProgress size={24} aria-label="Loading users" /> : loadError ? <p>{loadError}</p> : (
            <>
                <TableContainer component={Paper} sx={{ maxHeight: 360, border: 1, borderColor: 'divider', borderRadius: 1, boxShadow: 'none' }}>
                    <Table stickyHeader size="small" aria-label="Loaded users">
                        <TableHead>
                            <TableRow>
                                <TableCell>Id</TableCell>
                                <TableCell>Admin</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>FillPercentage</TableCell>
                                <TableCell>Created</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {companiesList.map((company: RecordModel) => (
                                <TableRow
                                    key={company.id}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell><a href={pbItemUrl('service_hosts', company.id)}>{company.id || 'Null'}</a></TableCell>
                                    <TableCell>{`${user.name} ${user.surname} (${user.email})`}</TableCell>
                                    <TableCell>{company.name || 'Null'}</TableCell>
                                    <TableCell>{`${countFillPercentage(company) * 100 | 0}%`}</TableCell>
                                    <TableCell>{company.created ? formatDate(company.created, false) : 'Unknown'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <DownloadExcel fileName={`Firmy użytkownika ${user.email}`} data={getTableRow()} />
                </Box>
            </>
        )}
    </Box>;
}