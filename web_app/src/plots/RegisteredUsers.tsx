
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

export const RegisteredUsers = ({ onSelect, selectedUser }: {
    onSelect: (v: RecordModel) => void;
    selectedUser: RecordModel | undefined;
}) => {
    const [usersList, setUsersList] = useState<RecordModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [detailsRecord, setDetailsRecord] = useState<RecordModel | undefined>(undefined);

    useEffect(() => {
        let isActive = true;
        const loadUsers = async () => {
            try {
                pb.autoCancellation(false);
                const users = await pb.collection('users').getFullList({ sort: '-created' });
                if (isActive) setUsersList(users);
            } catch (error) {
                if (isActive) {
                    setLoadError(error instanceof Error ? error.message : 'Unable to load users.');
                }
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        void loadUsers();
        return () => {
            isActive = false;
        };
    }, []);

    return <Box sx={{ mx: 6, my: 3 }}>

        {isLoading ? <CircularProgress size={24} aria-label="Loading users" /> : loadError ? <p>{loadError}</p> : (
            // <RadioGroup
            //   aria-label="Select a user"
            //   name="loaded-users"
            //   value={selectedUserId}
            //   onChange={(event) => setSelectedUserId(event.target.value)}
            // >
            <TableContainer component={Paper} sx={{ maxHeight: 360, border: 1, borderColor: 'divider', borderRadius: 1, boxShadow: 'none' }}>
                <Table stickyHeader size="small" aria-label="Loaded users">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" />
                            <TableCell>Id</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Surname</TableCell>
                            <TableCell>Verified</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usersList.map((user) => (
                            <TableRow
                                key={user.id}
                                hover
                                selected={selectedUser?.id === user.id}
                                onClick={() => onSelect(user)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell padding="checkbox">
                                    <Radio value={user.id} slotProps={{ input: { 'aria-label': `Select ${user.email || user.id}` } }} />
                                </TableCell>
                                <TableCell><a href={pbItemUrl('users', user.id)}>{user.id || 'Null'}</a></TableCell>
                                <TableCell>{user.name || 'Null'}</TableCell>
                                <TableCell>{user.surname || 'Null'}</TableCell>
                                <TableCell>{user.verified || 'Null'}</TableCell>
                                <TableCell>{user.email || 'Null'}</TableCell>
                                <TableCell>{user.created ? new Date(user.created).toLocaleDateString() : 'Unknown'}</TableCell>
                                <TableCell>
                                    <Tooltip title="View full record">
                                        <IconButton
                                            aria-label={`View details for ${user.email || user.id}`}
                                            size="small"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setDetailsRecord(user);
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

        )}
        <RecordDetailsDialog record={detailsRecord} onClose={() => setDetailsRecord(undefined)} />
    </Box>;
}