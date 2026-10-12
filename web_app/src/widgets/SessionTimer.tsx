
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

import { useEffect, useRef, useState } from 'react';
import '@xyflow/react/dist/style.css';

import { FiClock, } from "react-icons/fi";
import { sessionDurationMs, sessionExpiryStorageKey } from '../constants';




export function SessionTimer({ onExpire }: { onExpire: () => void }) {
    const warningThresholdSeconds = Math.ceil(sessionDurationMs * 0.1 / 1000);
    const warningShown = useRef(false);
    const [warningOpen, setWarningOpen] = useState(false);
    const [expiresAt, setExpiresAt] = useState(() => {
        const storedExpiry = Number(sessionStorage.getItem(sessionExpiryStorageKey));
        return Number.isFinite(storedExpiry) && storedExpiry > 0
            ? storedExpiry
            : Date.now() + sessionDurationMs;
    });
    const [secondsRemaining, setSecondsRemaining] = useState(() =>
        Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)),
    );

    useEffect(() => {
        sessionStorage.setItem(sessionExpiryStorageKey, String(expiresAt));

        const updateRemainingTime = () => {
            const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
            setSecondsRemaining(remaining);
            if (remaining > 0 && remaining <= warningThresholdSeconds && !warningShown.current) {
                warningShown.current = true;
                setWarningOpen(true);
            }
            if (remaining === 0) onExpire();
        };

        updateRemainingTime();
        const intervalId = window.setInterval(updateRemainingTime, 1000);
        document.addEventListener('visibilitychange', updateRemainingTime);
        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', updateRemainingTime);
        };
    }, [expiresAt, onExpire]);

    const refreshTimer = () => {
        if (Date.now() >= expiresAt) {
            onExpire();
            return;
        }
        const nextExpiry = Date.now() + sessionDurationMs;
        warningShown.current = false;
        setWarningOpen(false);
        sessionStorage.setItem(sessionExpiryStorageKey, String(nextExpiry));
        setExpiresAt(nextExpiry);
        setSecondsRemaining(sessionDurationMs);
    };
    const minutes = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
    const seconds = (secondsRemaining % 60).toString().padStart(2, '0');

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <IconButton aria-label="Refresh session timer" title="Refresh session timer" onClick={refreshTimer}>
                <FiClock size={20} />
            </IconButton>
            <span style={{ fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>{minutes}:{seconds}</span>
            <Snackbar
                open={warningOpen}
                autoHideDuration={10000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                onClose={() => setWarningOpen(false)}
            >
                <Alert severity="warning" onClose={() => setWarningOpen(false)}>
                    Session expires in {minutes}:{seconds}. Refresh the timer to stay signed in.
                </Alert>
            </Snackbar>
        </div>
    );
}
