import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { FiX } from 'react-icons/fi';
import type { RecordModel } from 'pocketbase';

export function RecordDetailsDialog({ record, onClose }: {
    record: RecordModel | undefined;
    onClose: () => void;
}) {
    return (
        <Dialog open={Boolean(record)} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Record details
                <IconButton aria-label="Close record details" onClick={onClose}>
                    <FiX />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {record && <Table size="small" aria-label="Full record information">
                    <TableBody>
                        {Object.entries(record).map(([field, value]) => (
                            <TableRow key={field}>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 700, width: '25%' }}>
                                    {field}
                                </TableCell>
                                <TableCell sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>
                                    {value !== null && typeof value === 'object'
                                        ? JSON.stringify(value, null, 2)
                                        : String(value ?? 'Null')}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>}
            </DialogContent>
        </Dialog>
    );
}