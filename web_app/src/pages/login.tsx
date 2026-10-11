

import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import Logo from '../assets/nolia_logo_poziom_5.svg'

import '@xyflow/react/dist/style.css';
import { pb } from '../constants';
import BackendEnvSelector from '../BackendEnvSelector';

function Login({ onLogin }: { onLogin: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });

    const handleLogin = async () => {
        setIsSubmitting(true);

        try {
            await pb.collection('_superusers').authWithPassword(email, password);
            setSnackbar({ open: true, message: 'Successfully logged in.', severity: 'success' });
            onLogin();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to log in.';
            setSnackbar({ open: true, message, severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (

        <div
            style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                minWidth: '400px',
                transform: 'translate(-50%, -50%)'
            }}
        >
            <Stack spacing={2}>
                <img src={Logo} alt="Logo" />
                <BackendEnvSelector />
                <TextField
                    label="Email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <TextField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowPassword((visible) => !visible)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <Button variant="contained"
                    onClick={handleLogin}
                    disabled={isSubmitting || !email || !password}
                >
                    {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
            </Stack>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div >
    );
}


export default Login;