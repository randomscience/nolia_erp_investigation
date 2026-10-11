
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { pb } from '../constants';
import { pbItemUrl } from '../helpers/PBFunctions';
import { RecordDetailsDialog } from '../widgets/RecordDetailsDialog';
import { FiEye } from 'react-icons/fi';


export const CreatedCompanies = ({ onSelect, selectedCompany }: {
    onSelect: (v: RecordModel) => void;
    selectedCompany: RecordModel | undefined;
}) => {
    const [companiesList, setCompaniesList] = useState<RecordModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [detailsRecord, setDetailsRecord] = useState<RecordModel | undefined>(undefined);

    useEffect(() => {
        let isActive = true;
        setIsLoading(true);
        setLoadError('');
        const loadCompanies = async () => {
            try {
                pb.autoCancellation(false);
                const companies = await pb.collection('service_hosts').getFullList({
                    sort: 'created',

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

    return <Box sx={{ mx: 6, my: 3 }}>
        {isLoading ? <CircularProgress size={24} aria-label="Loading users" /> : loadError ? <p>{loadError}</p> : (
            // <RadioGroup
            //   aria-label="Select a user"
            //   name="loaded-users"
            //   value={selectedCompany?.id}
            //   onChange={(event) => onSelect(event.target.value)}
            // >
            <TableContainer component={Paper} sx={{ maxHeight: 360, border: 1, borderColor: 'divider', borderRadius: 1, boxShadow: 'none' }}>
                <Table stickyHeader size="small" aria-label="Loaded users">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" />
                            <TableCell>Id</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>FillPercentage</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {companiesList.map((company: RecordModel) => (
                            <TableRow
                                key={company.id}
                                hover
                                selected={selectedCompany?.id === company.id}
                                onClick={() => onSelect(company)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell padding="checkbox">
                                    <Radio value={company.id} slotProps={{ input: { 'aria-label': `Select ${company.email || company.id}` } }} />
                                </TableCell>
                                <TableCell><a href={pbItemUrl('service_hosts', company.id)}>{company.id || 'Null'}</a></TableCell>
                                <TableCell>{company.name || 'Null'}</TableCell>
                                <TableCell>{`${countFillPercentage(company) * 100 | 0}%`}</TableCell>
                                <TableCell>{company.created ? new Date(company.created).toLocaleDateString() : 'Unknown'}</TableCell>
                                <TableCell>
                                    <Tooltip title="View full record">
                                        <IconButton
                                            aria-label={`View details for ${company.name || company.id}`}
                                            size="small"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setDetailsRecord(company);
                                            }}
                                        >
                                            <FiEye />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            // </RadioGroup>
        )}
        <RecordDetailsDialog record={detailsRecord} onClose={() => setDetailsRecord(undefined)} />
    </Box>;
}