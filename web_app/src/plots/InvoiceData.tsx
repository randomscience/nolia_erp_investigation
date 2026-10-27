
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert';
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
import { pbItemUrl } from '../helpers/PBFunctions';
import DownloadExcel from '../widgets/ExportToExcel';
import { formatAddress, formatInnerAddress, formatInnerZipCode, formatZipCode } from './CompanyTableHelpers';
import { MainButton } from '../widgets/MainButton';
import { FiCopy, FiMail } from 'react-icons/fi';

const invoiceStatusColors: Record<string, { background: string, border: string, text: string }> = {
    PENDING_USER_CONFIRMATION: { background: '#dbeafe', border: '#2563eb', text: '#1e3a8a' },
    CONFIRMATION_PAYMENT_SENT: { background: '#f3e8ff', border: '#7e22ce', text: '#581c87' },
    AWAITING_NOLIA_VERIFICATION: { background: '#ffedd5', border: '#c2410c', text: '#7c2d12' },
    CONFIRMED: { background: '#dcfce7', border: '#15803d', text: '#14532d' },
    DENIED: { background: '#fee2e2', border: '#b91c1c', text: '#7f1d1d' },
};

interface InvoiceDataTableRowInterface {
    id: string | undefined

    adminName: string,
    adminSurname: string,
    adminEmail: string,

    name: string | undefined

    invoiceAddress: string | undefined
    invoiceZipCode: string | undefined
    bankAccount: string
    status: string
    statusDescription: string

    address: string | undefined
    zipCode: string | undefined

    email: string,
}

export const InvoiceData = () => {
    const [companiesList, setCompaniesList] = useState<RecordModel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [emailMessage, setEmailMessage] = useState('');
    const [emailCopied, setEmailCopied] = useState(false);
    const [emailCopyError, setEmailCopyError] = useState('');


    useEffect(() => {
        let isActive = true;
        setIsLoading(true);
        setLoadError('');
        const loadCompanies = async () => {
            try {
                pb.autoCancellation(false);
                const companies = await pb.collection('service_hosts').getFullList({
                    sort: 'created',
                    expand: 'addresses,admins,invoice_data,invoice_data.address'
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

        var adminIndex = 0;
        const status = company.expand?.invoice_data?.status;
        const statusColors = invoiceStatusColors[status] ?? {
            background: 'grey.100',
            border: 'grey.500',
            text: 'text.secondary',
        };
        // console.log(company.expand?.admins[0]);
        console.log(company.expand?.invoice_data)
        if (company.expand?.invoice_data != undefined)
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
                    <TableCell>{company.expand?.invoice_data?.nip || "Null"}</TableCell>
                    <TableCell>{company.expand?.invoice_data?.full_name || "Null"}</TableCell>

                    <TableCell>{formatInnerAddress(company)}</TableCell>
                    <TableCell>{formatInnerZipCode(company)}</TableCell>

                    <TableCell>{company.expand?.invoice_data?.bank_account || "Null"}</TableCell>
                    <TableCell>
                        <Chip
                            label={status || "Null"}
                            aria-label={status || "Null"}
                            title={status || "Null"}
                            size="small"
                            sx={{
                                bgcolor: statusColors.background,
                                border: '1px solid',
                                borderColor: statusColors.border,
                                color: statusColors.text,
                                fontWeight: 600,
                                width: 'max-content',
                                minWidth: 12,
                                maxWidth: 12,
                                height: 12,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                borderRadius: '50%',
                                transition: 'max-width 200ms ease, height 200ms ease, border-radius 200ms ease',
                                '& .MuiChip-label': {
                                    maxWidth: 0,
                                    padding: 0,
                                    opacity: 0,
                                    overflow: 'hidden',
                                    transition: 'max-width 200ms ease, padding 200ms ease, opacity 150ms ease',
                                },
                                '&:hover': {
                                    maxWidth: 320,
                                    height: 24,
                                    borderRadius: 1.5,
                                },
                                '&:hover .MuiChip-label': {
                                    maxWidth: 300,
                                    paddingInline: 1,
                                    opacity: 1,
                                },
                            }}
                        />
                    </TableCell>
                    <TableCell>{company.expand?.invoice_data?.status_description || "Null"}</TableCell>

                    <TableCell>{formatAddress(company)}</TableCell>
                    <TableCell>{formatZipCode(company)}</TableCell>
                    <TableCell>{company.email || 'Null'}</TableCell>


                </TableRow >)

        return rows;

    }

    function getEmailMessage(): string {
        const companiesAwaitingVerification = companiesList.filter(
            company => company.expand?.invoice_data?.status === 'AWAITING_NOLIA_VERIFICATION' ||
                company.expand?.invoice_data?.status === 'PENDING_USER_CONFIRMATION' ||
                company.expand?.invoice_data?.status === 'CONFIRMATION_PAYMENT_SENT'
        );

        const companyDetails = companiesAwaitingVerification.map((company, index) => {
            const admin = company.expand?.admins?.[0];
            const invoiceData = company.expand?.invoice_data;

            return [
                `${index + 1}. ${company.name || 'Brak nazwy'}`,
                `Osoba kontaktowa: ${[admin?.name, admin?.surname].filter(Boolean).join(' ') || 'Brak danych'}`,
                `E-mail: ${admin?.email || 'Brak danych'}`,

                `Nazwa do faktury: ${invoiceData?.full_name || 'Brak danych'}`,
                `Adres do faktury: ${formatInnerAddress(company)}`,
                `Kod pocztowy: ${formatInnerZipCode(company)}`,
                `Numer rachunku bankowego: ${invoiceData?.bank_account || 'Brak danych'}`,
            ].join('\n');
        });

        if (companyDetails.length === 0) {
            return 'Dzień dobry,\n\nObecnie nie ma firm oczekujących na weryfikację danych do faktury.';
        }

        return [
            'Dzień dobry,',
            '',
            'Proszę o weryfikację danych do faktury dla poniższych firm:',
            '',
            companyDetails.join('\n\n'),
            '',
            'Proszę o potwierdzenie poprawności danych lub informację o koniecznych zmianach.',
            '',
            'Pozdrawiam',
        ].join('\n');

    };

    async function copyEmailMessage(message: string): Promise<void> {
        setEmailCopied(false);
        setEmailCopyError('');

        try {
            if (!navigator.clipboard?.writeText) {
                throw new Error('Schowek jest niedostępny w tej przeglądarce.');
            }
            await navigator.clipboard.writeText(message);
            setEmailCopied(true);
        } catch (error) {
            setEmailCopyError(error instanceof Error
                ? `Nie udało się skopiować wiadomości: ${error.message}`
                : 'Nie udało się skopiować wiadomości. Możesz zaznaczyć i skopiować jej treść ręcznie.');
        }
    }

    function openEmailDialog(): void {
        const message = getEmailMessage();
        setEmailMessage(message);
        setEmailDialogOpen(true);
        void copyEmailMessage(message);
    }

    function getTableRow(): InvoiceDataTableRowInterface[] {

        const result: InvoiceDataTableRowInterface[] = []
        var adminIndex = 0
        for (var x of companiesList) {
            result.push({
                id: x.id,
                name: x.name || 'Null',
                adminName: x.expand?.admins[adminIndex]?.name,
                adminSurname: x.expand?.admins[adminIndex]?.surname,
                adminEmail: x.expand?.admins[adminIndex]?.email,
                status: x.status || 'Null',
                address: formatAddress(x),
                zipCode: formatZipCode(x),
                invoiceAddress: "",
                invoiceZipCode: "",
                bankAccount: "",
                statusDescription: "",
                email: x.email || 'Null',
            })

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
                            <TableCell>NIP</TableCell>
                            <TableCell>Full Name</TableCell>

                            <TableCell>Invoice Address</TableCell>
                            <TableCell>Invoice ZipCode</TableCell>

                            <TableCell>Bank Account</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Status Desc</TableCell>

                            <TableCell>Address</TableCell>
                            <TableCell>ZipCode</TableCell>
                            <TableCell>Email</TableCell>

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
            <MainButton leftIcon={<FiMail />} label="Kopiuj treść e-maila" onClick={openEmailDialog} />
            <DownloadExcel fileName={`Firmy w platformie`} data={getTableRow()} />
        </Box>
        <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} fullWidth maxWidth="md">
            <DialogTitle>Treść wiadomości e-mail</DialogTitle>
            <DialogContent dividers>
                {emailCopied && <Alert severity="success" sx={{ mb: 2 }}>Wiadomość skopiowano do schowka.</Alert>}
                {emailCopyError && <Alert severity="error" sx={{ mb: 2 }}>{emailCopyError} Możesz skopiować treść ręcznie.</Alert>}
                <Box
                    component="pre"
                    sx={{
                        m: 0,
                        fontFamily: 'inherit',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        userSelect: 'text',
                    }}
                >
                    {emailMessage}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button startIcon={<FiCopy />} onClick={() => void copyEmailMessage(emailMessage)}>
                    Kopiuj ponownie
                </Button>
                <Button onClick={() => setEmailDialogOpen(false)}>Zamknij</Button>
            </DialogActions>
        </Dialog>
    </Box>;
}
